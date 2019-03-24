const {template, types: t} = require('@babel/core');

const buildInjection = template(`
  var injectors = this.constructor.INJECTORS;

  if (Array.isArray(injectors)) {
    for (const inject of injectors) {
      inject.call(this);
    }
  }
`);

const buildSuperWithSpreadArgs = template(`super(...args)`);

const buildConstructor = (injection, withSuper = false) => {
  const args = withSuper ? [t.restElement(t.identifier('args'))] : [];
  const superWithArgs = withSuper && buildSuperWithSpreadArgs();

  return t.classMethod(
    'constructor',
    t.identifier('constructor'),
    args,
    t.blockStatement([superWithArgs, ...injection].filter(Boolean)),
  );
};

const hasClassDecorators = classNode => !!(classNode.decorators && classNode.decorators.length);
const hasMethodDecorators = classMembers =>
  classMembers.some(node => node.decorators && node.decorators.length);
const isConstructor = node => node.kind === 'constructor';
const isExtended = classNode => classNode.superClass !== null;
const isSuperCall = node =>
  t.isExpressionStatement(node) &&
  t.isCallExpression(node.expression) &&
  node.expression.callee.type === 'Super';

const hasConstructor = classMembers =>
  classMembers.some(node => t.isClassMethod(node) && isConstructor(node));

const defaultInjectorsPropName = '__injectors';

const defaultState = {
  isExtended: false,
  type: null,
};

const babelPluginInjectDecoratorInitializer = () => ({
  pre() {
    this.state = defaultState;
  },
  visitor: {
    Class(path) {
      if (!hasClassDecorators(path.node) && !hasMethodDecorators(path.node.body.body)) {
        return;
      }

      this.state = {
        isExtended: isExtended(path.node),
        type: hasConstructor(path.node.body.body) ? 'ClassMethod' : 'ClassBody',
      };
    },
    ClassBody(path, {opts}) {
      if (this.state.type !== 'ClassBody') {
        return;
      }

      const injection = buildInjection({
        INJECTORS: opts.injectorsPropName || defaultInjectorsPropName,
      });
      const constructorInjection = buildConstructor(injection, this.state.isExtended);
      const body = [constructorInjection, ...path.node.body];

      const replacement = Object.assign(t.cloneNode(path.node), {body});

      path.replaceWith(replacement);

      this.state = defaultState;
    },

    ClassMethod(path, {opts}) {
      if (this.state.type !== 'ClassMethod' || !isConstructor(path.node)) {
        return;
      }

      const injection = buildInjection({
        INJECTORS: opts.injectorsPropName || defaultInjectorsPropName,
      });

      let isInjected = false;
      const newMembers = path.node.body.body.reduce((acc, member) => {
        acc.push(t.cloneNode(member));

        if (isSuperCall(member)) {
          acc.push(...injection);
          isInjected = true;
        }

        return acc;
      }, []);

      if (!isInjected) {
        newMembers.unshift(...injection);
      }

      const replacement = Object.assign(t.cloneNode(path.node), {
        body: t.blockStatement(newMembers),
      });

      path.replaceWith(replacement);

      this.state = defaultState;
    },
  },
});

module.exports = babelPluginInjectDecoratorInitializer;
