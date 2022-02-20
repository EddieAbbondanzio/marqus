module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testEnvironment: "jsdom",
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFiles: ["<rootDir>/test/setup.ts"],
};
