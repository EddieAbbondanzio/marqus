const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: [path.resolve(__dirname, "src", "renderer", "index.ts")],

  output: {
    path: path.resolve(__dirname, "demo"),
    filename: "bundle.js",
  },
  devServer: {
    open: true,
    port: 9000,
    historyApiFallback: true,
  },
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sass"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "renderer", "index.html"),
      title: "Marker Notes",
      // TODO: Add this...
      // favicon: ""
    }),
  ],
};
