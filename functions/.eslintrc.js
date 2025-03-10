module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    quotes: ["error", "double"],
    "max-len": ["error", { "code": 120 }],
    "no-unused-vars": "warn",
    "require-jsdoc": "off"
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
}; 