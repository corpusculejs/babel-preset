const {transformFileAsync} = require('@babel/core');
const {readFile} = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');

const readFileAsync = promisify(readFile);

const getOptions = fixture => require(resolve(__dirname, 'fixtures', fixture, 'options.js'));

const compare = async fixture => {
  const options = getOptions(fixture);
  const fixtureDir = resolve(__dirname, 'fixtures', fixture);

  const {code: inputCode} = await transformFileAsync(resolve(fixtureDir, 'input.js'), options);
  const outputCode = await readFileAsync(resolve(fixtureDir, 'output.js'), 'utf8');

  expect(inputCode).toBe(outputCode.trim());
};

const execute = async fixture => {
  const options = getOptions(fixture);
  const {code} = await transformFileAsync(
    resolve(__dirname, 'fixtures', fixture, 'exec.js'),
    options,
  );
  eval(code);
};

describe('babel-plugin-inject-decorator-initializer', () => {
  it('injects function into a class without constructor', async () => {
    await execute('simple-class');
  });

  it('injects function into an extended class without constructor', async () => {
    await execute('extended-class');
  });

  it('injects function into a class with constructor', async () => {
    await execute('simple-with-constructor');
  });

  it('injects function into an extended class with constructor', async () => {
    await execute('extended-with-constructor');
  });

  it('does not break the order of constructor statements', async () => {
    await execute('extended-with-call-before-super');
  });

  it('does not break other class memebers', async () => {
    await execute('keep-class-members');
  });

  it('works with multiple classes', async () => {
    await execute('multiple-classes');
  });

  it('runs both extending class and super class injections', async () => {
    await execute('super-injections');
  });

  it('works with property decorators', async () => {
    await execute('property-decorators');
  });

  it('runs injections before user-defined constructor', async () => {
    await execute('runs-before');
  });

  it('allows to define custom injectors property name', async () => {
    await execute('injectors-prop-name');
  });

  it('allows to import injector module instead of generating code in place', async () => {
    await compare('use-import');
  });
});
