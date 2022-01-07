
module.exports = {
  ...require('../jest.common'),

  coverageDirectory: "coverage",
  collectCoverageFrom: ["./src/**/*.ts"],
  
  rootDir: ".",
};
