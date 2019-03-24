const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  plugins: [
    require(resolve(cwd, 'src/babel-plugin-inject-decorator-initializer')),
    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
  ],
};
