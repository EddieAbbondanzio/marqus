const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

module.exports = {
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules,
  },
  plugins: [...plugins, new MonacoWebpackPlugin()],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sass"],
  },
};
