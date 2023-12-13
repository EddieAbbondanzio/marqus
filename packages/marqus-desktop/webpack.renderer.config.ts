import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
import { ProvidePlugin, type Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from './webpack.plugins';

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
    new MonacoWebpackPlugin(),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sass"],
  },
};
