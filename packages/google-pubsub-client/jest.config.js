// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require('../jest.common'),
  forceExit: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts"],
  rootDir: ".",
  testTimeout: 10000,
};
