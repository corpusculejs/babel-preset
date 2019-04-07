const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  presets: [
    require('@babel/preset-env', {
      targets: {
        ie: '11',
      },
      modules: 'commonjs',
    }),
  ],
  plugins: [
    require(resolve(cwd, 'lib/babel-plugin-inject-decorator-initializer')),
    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
    [require('@babel/plugin-proposal-class-properties'), {loose: true}],
  ],
};
