const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  plugins: [
    [
      require(resolve(cwd, 'src/babel-plugin-inject-decorator-initializer')),
      {injectorsPropName: '__customInjectors'},
    ],
    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
  ],
};
