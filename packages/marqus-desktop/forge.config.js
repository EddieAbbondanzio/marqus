const path = require("path");

const name = "marqus";
const iconPath = path.join(__dirname, "/static/icon.png");

module.exports = {
  // Available options:
  // https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html
  packagerConfig: {
    // Only supports Windows / Mac
    icon: "static/icon.png",
    executableName: "marqus-desktop",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        name,
        productName: "Marqus",
        genericName: "Text Editor",
        icon: iconPath,
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        name,
        productName: "Marqus",
        genericName: "Text Editor",
        icon: "static/icon.png",
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        // unsafe-eval is required for source map support in dev. We don't set
        // it in prod so it's safe to ignore that scary warning in the console.
        devContentSecurityPolicy:
          "default-src ws://localhost:3000 http://localhost:3000 self; style-src 'unsafe-inline'; img-src * attachment://*; script-src-elem 'self' 'unsafe-eval'; script-src 'self' 'unsafe-eval';",
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer/index.ts",
              name: "main_window",
              preload: {
                js: "./src/renderer/preload.ts",
              },
            },
          ],
        },
      },
    },
  ],
};
