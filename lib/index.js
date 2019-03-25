module.exports = {
  plugins: [
    [require('./babel-plugin-inject-decorator-initializer'), {useImport: true}],
    [require('@babel/plugin-proposal-decorators'), {legacy: true}],
    [require('@babel/plugin-proposal-class-properties'), {loose: true}],
  ],
};
