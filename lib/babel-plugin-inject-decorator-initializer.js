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

const babelPluginInjectDecoratorInitializer = () => ({
  pre() {
    this.injection = null;
    this.isExtended = false;
    this.constructorNode = null;
    this.constructorFirstOriginalStatement = null;
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
      enter(path, state) {
        if (!hasClassDecorators(path.node) && !hasMethodDecorators(path.node.body.body)) {
          return;
        }

        this.injection = buildCall({
          CLASS: t.cloneNode(path.node.id),
          PROP: state.opts.injectorsPropName || defaultInjectorsPropName,
        });

        this.isExtended = isExtended(path.node);

        const constructor = path.node.body.body.find(isConstructor);

        if (constructor) {
          this.constructorFirstOriginalStatement = getConstructorFirstOriginalStatement(
            constructor.body.body,
          );
        }
      },
    },
    ClassBody: {
      exit(path) {
        if (!this.injection || this.constructorNode) {
          return;
        }

        const constructorInjection = buildConstructor(this.injection, this.isExtended);
        path.node.body = [constructorInjection, ...path.node.body];
      },
    },

    ClassMethod: {
      exit(path) {
        if (!this.injection || !isConstructor(path.node) || this.constructorNode === path.node) {
          return;
        }

        let isInjected = false;
        const newBody = path.node.body.body.reduce((acc, member) => {
          if (member === this.constructorFirstOriginalStatement) {
            acc.push(this.injection);
            isInjected = true;
          }

          acc.push(member);

          return acc;
        }, []);

        if (!isInjected) {
          newBody.push(this.injection);
        }

        path.node.body.body = newBody;

        this.constructorNode = path.node;
      },
    },
  },
});

module.exports = babelPluginInjectDecoratorInitializer;
