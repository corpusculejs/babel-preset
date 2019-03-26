const {template, types: t} = require('@babel/core');
const {readFileSync} = require('fs');
const {resolve} = require('path');

// Index of the char that ends `export default` expression
// in the runtime-injector.js
const EXPORT_END_INDEX = 15;

const runtimeInjectFile = readFileSync(resolve(__dirname, './runtime-injector.js'), 'utf8').slice(
  EXPORT_END_INDEX,
);

const buildFunction = template(runtimeInjectFile);
const buildCall = template('_injectDecoratorInitializer(this, CLASS.PROP);');
const buildImport = template(
  'import _injectDecoratorInitializer from "@corpuscule/babel-preset/lib/runtime-injector";',
);
const buildSuperWithSpreadArgs = template('super(...args)');
const buildInjectorProp = injectorsPropName => {
  const node = t.classProperty(t.identifier(injectorsPropName), t.arrayExpression());
  node.static = true;

  return node;
};

const buildConstructor = (injection, withSuper = false) => {
  const args = withSuper ? [t.restElement(t.identifier('args'))] : [];
  const superWithArgs = withSuper && buildSuperWithSpreadArgs();

  return t.classMethod(
    'constructor',
    t.identifier('constructor'),
    args,
    t.blockStatement([superWithArgs, injection].filter(Boolean)),
  );
};

const hasClassDecorators = classNode => !!(classNode.decorators && classNode.decorators.length);
const hasMethodDecorators = classMembers =>
  classMembers.some(node => node.decorators && node.decorators.length);
const isConstructor = node => t.isClassMethod(node) && node.kind === 'constructor';
const isExtended = classNode => classNode.superClass !== null;
const isSuperCall = node =>
  t.isExpressionStatement(node) &&
  t.isCallExpression(node.expression) &&
  node.expression.callee.type === 'Super';

const getConstructorFirstOriginalStatement = statements => {
  // If we don't have `super()`, we will return the first statement (or
  // undefined if constructor is empty). Otherwise, we will return
  // `super()` if it the only it in constructor or the first statement comes
  // after it if there is anything.
  let [firstStatement] = statements;
  for (const node of statements) {
    if (isSuperCall(node)) {
      firstStatement = null;
      continue;
    }

    if (firstStatement === null) {
      return node;
    }
  }

  return firstStatement;
};

const defaultInjectorsPropName = '__injectors';

const defaultClassState = {
  constructorNode: null,
  constructorFirstOriginalStatement: null,
  injectorsPropNode: null,
  injection: null,
  isInjecting: false,
  isExtended: false,
};

const babelPluginInjectDecoratorInitializer = () => {
  return {
    pre() {
      this.classState = {...defaultClassState};
    },
    visitor: {
      Program: {
        exit(path, {opts}) {
          if (opts.useImport) {
            const importStatement = buildImport();
            path.unshiftContainer('body', importStatement);
          } else {
            const functionDeclaration = buildFunction();
            let isInjected = false;
            path.node.body = path.node.body.reduce((acc, member) => {
              if (!isInjected && !t.isImport(member)) {
                acc.push(functionDeclaration);
                isInjected = true;
              }

              acc.push(member);

              return acc;
            }, []);
          }
        },
      },

      Class: {
        enter(path, {opts}) {
          const classBody = path.node.body;

          if (
            (!hasClassDecorators(path.node) && !hasMethodDecorators(classBody.body)) ||
            this.classState.injectorsPropNode
          ) {
            return;
          }

          this.classState.isInjecting = true;

          const injectorsPropName = opts.injectorsPropName || defaultInjectorsPropName;

          this.classState.injection = buildCall({
            CLASS: t.cloneNode(path.node.id),
            PROP: injectorsPropName,
          });

          this.classState.isExtended = isExtended(path.node);

          // We need to inject static field before @babel/plugin-proposal-class-properties
          // convert it.
          if (!this.classState.injectorsPropNode) {
            this.classState.injectorsPropNode = buildInjectorProp(injectorsPropName);
            classBody.body = [this.classState.injectorsPropNode, ...classBody.body];
          }

          // Detecting user's first constructor statement after super().
          // It is necessary for correct insertion
          if (!this.classState.constructorFirstOriginalStatement) {
            const constructorNode = classBody.body.find(isConstructor);

            if (constructorNode) {
              this.classState.constructorFirstOriginalStatement = getConstructorFirstOriginalStatement(
                constructorNode.body.body,
              );
            }
          }
        },
        exit() {
          this.classState = {...defaultClassState};
        },
      },

      ClassBody: {
        exit(path) {
          if (!this.classState.isInjecting) {
            return;
          }

          // If class does not have constructor we need to create one.
          if (!this.classState.constructorNode) {
            const constructorInjection = buildConstructor(
              this.classState.injection,
              this.classState.isExtended,
            );
            path.node.body = [constructorInjection, ...path.node.body];
          }
        },
      },

      ClassMethod: {
        exit(path) {
          if (
            !this.classState.isInjecting ||
            !isConstructor(path.node) ||
            this.classState.constructorNode === path.node
          ) {
            return;
          }

          let isInjected = false;

          // If class has constructor we have to inject initialization statement
          // just before user's first statement after super().
          const newBody = path.node.body.body.reduce((acc, member) => {
            if (member === this.classState.constructorFirstOriginalStatement) {
              acc.push(this.classState.injection);
              isInjected = true;
            }

            acc.push(member);

            return acc;
          }, []);

          if (!isInjected) {
            newBody.push(this.classState.injection);
          }

          path.node.body.body = newBody;

          this.classState.constructorNode = path.node;
        },
      },
    },
  };
};

module.exports = babelPluginInjectDecoratorInitializer;
