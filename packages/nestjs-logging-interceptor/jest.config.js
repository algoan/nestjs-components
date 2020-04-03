// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  collectCoverageFrom: ["**/*.ts", "!test/**/*"],

  testEnvironment: "node",

  rootDir: ".",

  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "json"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "\\.(ts)$": "ts-jest"
  },

};
