const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  plugins: [
    [
      require(resolve(cwd, 'lib/babel-plugin-inject-decorator-initializer')),
      {registrationsPropName: '__customRegistrations'},
    ],
    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
    [require('@babel/plugin-proposal-class-properties'), {loose: true}],
  ],
};
