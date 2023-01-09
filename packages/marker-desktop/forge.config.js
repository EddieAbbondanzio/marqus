const name = "marker";

module.exports = {
  packagerConfig: {
    // Only supports Windows / Mac
    icon: "static/icon.png",
    executableName: "marker-desktop",
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
        productName: "Marker",
        genericName: "Text Editor",
        icon: "static/icon.png",
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        name,
        productName: "Marker",
        genericName: "Text Editor",
        icon: "static/icon.png",
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
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
