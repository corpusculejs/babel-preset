const {template, types: t} = require('@babel/core');

/* ================
 * Builders
 * ================ */

const buildFunction = template(`
function _injectDecoratorInitializer(target, callbacks) {
  for (var i = 0; i < callbacks.length; i++) {
    callbacks[i](target);
  }
}
`);
const buildCall = template('_injectDecoratorInitializer(TARGET, CLASS.PROP);');
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

/* ================
 * Checkers
 * ================ */

const hasClassDecorators = classNode => !!(classNode.decorators && classNode.decorators.length);
const hasMethodDecorators = classMembers =>
  classMembers.some(node => node.decorators && node.decorators.length);
const isConstructor = node => t.isClassMethod(node) && node.kind === 'constructor';
const isClassExtended = classNode => classNode.superClass !== null;
const isSuperCall = node =>
  t.isExpressionStatement(node) &&
  t.isCallExpression(node.expression) &&
  node.expression.callee.type === 'Super';

/* ================
 * Getters
 * ================ */

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

const defaultInitializersPropName = '__initializers';
const defaultRegistrationsPropName = '__registrations';

/* =============================================================
 * Helpers for call the _injectDecoratorInitializer function
 * ============================================================= */

// If it is a class expression, we have to get the class temporary
// variable (usually _temp) and use it for initializers call and
// registrations call because class expressions can have no names.
const prepareExpressionNodes = path => {
  const temporatyRegistrationCallNode = t.callExpression(t.identifier('temp'), []);
  const [assignmentPath, registrationCallPath] = path.insertAfter(temporatyRegistrationCallNode);

  return [assignmentPath.node.left, registrationCallPath];
};

const createRegistrationsCall = (registrations, idNode) =>
  buildCall({
    CLASS: t.cloneNode(idNode),
    PROP: registrations,
    TARGET: t.cloneNode(idNode),
  });

const createInitializersCall = (initializers, idNode) =>
  buildCall({
    CLASS: t.cloneNode(idNode),
    PROP: initializers,
    TARGET: t.thisExpression(),
  });

/* ============================
 * Static properties helper
 * ============================ */

const injectStaticFields = (classBody, {initializers, registrations}) => {
  // We need to inject static fields before @babel/plugin-proposal-class-properties
  // convert it.
  const injectorsNode = buildInjectorProp(initializers);
  const registrationsNode = buildInjectorProp(registrations);
  classBody.body = [injectorsNode, registrationsNode, ...classBody.body];
};

/* ===============
 * Transformers
 * =============== */

const transformConstructor = (node, initializersCallNode) => {
  let isInjected = false;

  const firstOriginalStatement = getConstructorFirstOriginalStatement(node.body.body);

  // If class has constructor we have to inject initialization statement
  // just before user's first statement after super().
  const newBody = node.body.body.reduce((acc, member) => {
    if (member === firstOriginalStatement) {
      acc.push(initializersCallNode);
      isInjected = true;
    }

    acc.push(member);

    return acc;
  }, []);

  if (!isInjected) {
    newBody.push(initializersCallNode);
  }

  node.body.body = newBody;
};

const transformClassBody = (node, initializersCallNode, isExtended) => {
  // If class does not have constructor we need to create one.
  const constructorInjection = buildConstructor(initializersCallNode, isExtended);

  node.body = [constructorInjection, ...node.body];
};

const transformClass = (path, opts) => {
  const classBody = path.node.body;
  const classIdNode = path.node.id;
  const constructorNode = classBody.body.find(isConstructor);
  const isClassExpression = t.isClassExpression(path.node);
  const isExtended = isClassExtended(path.node);

  const propNames = {
    initializers: opts.initializersPropName || defaultInitializersPropName,
    registrations: opts.registrationsPropName || defaultRegistrationsPropName,
  };

  injectStaticFields(classBody, propNames);

  let initializersCallNode;

  if (isClassExpression) {
    const [classVariableNode, registrationCallPath] = prepareExpressionNodes(path);
    const registrationCallNode = createRegistrationsCall(
      propNames.registrations,
      classVariableNode,
    );
    registrationCallPath.replaceWith(registrationCallNode);

    initializersCallNode = createInitializersCall(propNames.initializers, classVariableNode);
  } else {
    const registrationCallNode = createRegistrationsCall(propNames.registrations, classIdNode);
    path.insertAfter(registrationCallNode);

    initializersCallNode = createInitializersCall(propNames.initializers, classIdNode);
  }

  if (constructorNode) {
    transformConstructor(constructorNode, initializersCallNode);
  } else {
    transformClassBody(classBody, initializersCallNode, isExtended);
  }
};

/* =============================================
 * Function body and function import injectors
 * ============================================= */

const addInjectorImport = path => {
  const importStatement = buildImport();
  path.unshiftContainer('body', importStatement);
};

const addInjectorFunction = path => {
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
};

/* ===============
 * Babel plugin
 * =============== */

const babelPluginInjectDecoratorInitializer = () => {
  return {
    pre() {
      this.processedClasses = new Set();
      this.processedPrograms = new Set();
    },
    visitor: {
      Program(path, {opts}) {
        let isInjectorAdded = false;

        path.traverse({
          Decorator() {
            if (isInjectorAdded) {
              return;
            }

            if (opts.useImport) {
              addInjectorImport(path);
            } else {
              addInjectorFunction(path);
            }

            isInjectorAdded = true;
          },
        });
      },

      Class(path, {opts}) {
        if (
          (!hasClassDecorators(path.node) && !hasMethodDecorators(path.node.body.body)) ||
          this.processedClasses.has(path.node)
        ) {
          return;
        }
        this.processedClasses.add(path.node);
        transformClass(path, opts);
      },
    },
  };
};

module.exports = babelPluginInjectDecoratorInitializer;
