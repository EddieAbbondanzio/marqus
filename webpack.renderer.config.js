const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const rules = require("./webpack.rules");

module.exports = {
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules,
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new MonacoWebpackPlugin()],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sass"],
  },
};
