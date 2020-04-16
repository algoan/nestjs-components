// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require('../jest.common'),

  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts"],

  rootDir: ".",

};
