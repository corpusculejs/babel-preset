const {transformFileAsync} = require('@babel/core');
const {readFile} = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(readFile);

const getOptions = (fixture, type) =>
  require(resolve(__dirname, 'fixtures', type, fixture, 'options.js'));

const compare = async (fixture, type) => {
  const options = getOptions(fixture, type);
  const fixtureDir = resolve(__dirname, 'fixtures', type, fixture);

  const {code: inputCode} = await transformFileAsync(resolve(fixtureDir, 'input.js'), options);
  const outputCode = await readFileAsync(resolve(fixtureDir, 'output.js'), 'utf8');

  expect(inputCode).toBe(outputCode.trim());
};

const execute = async (fixture, type) => {
  const options = getOptions(fixture, type);
  const {code} = await transformFileAsync(
    resolve(__dirname, 'fixtures', type, fixture, 'exec.js'),
    options,
  );
  eval(code);
};

describe('babel-plugin-inject-decorator-initializer', () => {
  describe('common', () => {
    it('allows to import injector module instead of generating code in place', async () => {
      await compare('use-import', 'common');
    });

    it('works correctly with env preset', async () => {
      await execute('preset-env', 'common');
    });

    it('correctly transforms injector import to commonjs', async () => {
      await compare('commonjs-import', 'common');
    });

    it('does not create a function declaration/import if there is no decorator in the file', async () => {
      await compare('no-decorators', 'common');
    });

    it('does not duplicate function declaration with multiple decorators', async () => {
      await compare('multiple-decorators', 'common');
    });
  });

  describe('initializers', () => {
    it('works with a class without constructor', async () => {
      await execute('simple-class', 'initializers');
    });

    it('works with an extended class without constructor', async () => {
      await execute('extended-class', 'initializers');
    });

    it('works with a class with constructor', async () => {
      await execute('simple-with-constructor', 'initializers');
    });

    it('works with an extended class with constructor', async () => {
      await execute('extended-with-constructor', 'initializers');
    });

    it('works with multiple classes', async () => {
      await execute('multiple-classes', 'initializers');
    });

    it('works with property decorators', async () => {
      await execute('property-decorators', 'initializers');
    });

    it('does not break the order of constructor statements', async () => {
      await execute('extended-with-call-before-super', 'initializers');
    });

    it('does not break other class memebers', async () => {
      await execute('keep-class-members', 'initializers');
    });

    it('runs both extending class and super class initializers', async () => {
      await execute('super-injections', 'initializers');
    });

    it('runs initializers before user-defined constructor', async () => {
      await execute('runs-before', 'initializers');
    });

    it('allows to define custom initializers property name', async () => {
      await execute('custom-initializers-prop', 'initializers');
    });

    it('works with class expression', async () => {
      await execute('class-expression', 'initializers');
    });
  });

  describe('registrations', () => {
    it('works with a class without constructor', async () => {
      await execute('simple-class', 'registrations');
    });

    it('works with an extended class', async () => {
      await execute('extended-class', 'registrations');
    });

    it('works with multiple classes', async () => {
      await execute('multiple-classes', 'registrations');
    });

    it('works with property decorators', async () => {
      await execute('property-decorators', 'registrations');
    });

    it('allows to define custom registrations property name', async () => {
      await execute('custom-registrations-prop', 'registrations');
    });

    it('works with class expression', async () => {
      await execute('class-expression', 'registrations');
    });

    it('does not break other class memebers', async () => {
      await execute('keep-class-members', 'registrations');
    });
  });
});
