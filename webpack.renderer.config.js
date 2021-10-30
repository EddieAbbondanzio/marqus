const path = require("path")

const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

module.exports = {
  devServer: {
    historyApiFallback: true
  },
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', ".scss", ".sass"],
  },
  
};
