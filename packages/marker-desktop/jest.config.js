module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFiles: ["<rootDir>/test/setup.ts"],
  moduleNameMapper: {
    "monaco-editor": "<rootDir>/test/__mocks__/monaco.ts",
  },
  clearMocks: true,
  globals: {
    "ts-jest": {
      // ts-jest configuration goes here
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
