module.exports = {

  testMatch: ['**/*.+(test|spec).ts'],

  testEnvironment: "node",

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

}