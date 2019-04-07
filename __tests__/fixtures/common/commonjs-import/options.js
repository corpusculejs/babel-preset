const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  plugins: [
    [require('@babel/plugin-transform-modules-commonjs')],
    [require(resolve(cwd, 'lib/babel-plugin-inject-decorator-initializer')), {useImport: true}],
    [require('@babel/plugin-syntax-decorators'), {legacy: true}],
  ],
};
