const {resolve} = require('path');
const cwd = process.cwd();

module.exports = {
  plugins: [require(resolve(cwd, 'lib/babel-plugin-inject-decorator-initializer'))],
};
