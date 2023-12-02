module.exports = [
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "ts-loader",
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
  },
  {
    test: /\.s[ac]ss$/i,
    use: [
      // Creates `style` nodes from JS strings
      "style-loader",
      // Translates CSS into CommonJS
      "css-loader",
      // Compiles Sass to CSS
      "sass-loader",
    ],
  },
  // Required to load Monaco's codicon.ttf so the icons will show in the ctrl+f
  // menu.
  // https://github.com/microsoft/monaco-editor/tree/main/webpack-plugin
  {
    test: /\.ttf$/,
    type: "asset/resource",
  },
];
