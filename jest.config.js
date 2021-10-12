module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  testMatch: ["./src/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};
