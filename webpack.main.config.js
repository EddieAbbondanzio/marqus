const path = require("path");

module.exports = {
  entry: "./src/main/index.ts",
  mode: "development",
  target: "electron-main",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: path.resolve(__dirname, "src/main"),
      },
    ],
  },
};
