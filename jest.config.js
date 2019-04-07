const path = require('path');

const cwd = process.cwd();

module.exports = {
  collectCoverageFrom: ['src/babel-plugin-inject-decorator-initializer.js'],
  coverageDirectory: '.coverage',
  moduleFileExtensions: ['js', 'json'],
  rootDir: cwd,
  testMatch: [path.resolve(cwd, '__tests__/index.js')],
  testEnvironment: 'node',
  testURL: 'http://localhost',
};
