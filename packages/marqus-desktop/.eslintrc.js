module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "react/prop-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-prototype-builtins": "off",
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["jest.config.js", "webpack.*.js", ".eslintrc.js"],
  parser: "@typescript-eslint/parser",
  root: true,
  plugins: ["react", "@typescript-eslint"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },
};
