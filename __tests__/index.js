const {transformFileAsync} = require('@babel/core');
const {resolve} = require('path');

const execute = async fixture => {
  const options = require(resolve(__dirname, 'fixtures', fixture, 'options.js'));
  const {code} = await transformFileAsync(
    resolve(__dirname, 'fixtures', fixture, 'exec.js'),
    options,
  );
  eval(code);
};

describe('babel-plugin-inject-decorator-initializer', () => {
  describe('different classes', () => {
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
  });

  it('runs injections before user-defined constructor', async () => {
    await execute('runs-before');
  });

  it('allows to define custom injectors property name', async () => {
    await execute('injectors-prop-name');
  });
});
