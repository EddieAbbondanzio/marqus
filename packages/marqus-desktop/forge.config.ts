import * as path from "path"
const iconPath = path.join(__dirname, "/static/icon.png");


import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({
    options: {
      name: "marqus",
      productName: "Marqus",
      genericName: "Text Editor",
      icon: iconPath,
    }
  }), new MakerDeb({
    options: {
      name: "marqus",
      productName: "Marqus",
      genericName: "Text Editor",
      icon: iconPath,
    }
  })],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/index.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
            // TODO: Double check this is for main only.
            nodeIntegration: true
          },
        ],
      },
    }),
  ],
};

export default config;
