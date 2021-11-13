import { IpcPlugin } from "../shared/ipc";
import { LoadConfig, SaveConfig } from "../shared/ipc/config";

export interface ConfigPlugin {
  loadConfig(params: LoadConfig): Promise<any>;
  saveConfig(params: SaveConfig): Promise<any>;
}

export const loadConfigPlugin: IpcPlugin<ConfigPlugin> = function ({
  sendIpc,
}) {
  return {
    async loadConfig(p) {
      const c = await sendIpc("config.load", p);
      return c;
    },
    async saveConfig(p) {
      const c = await sendIpc("config.save", p);
      return c;
    },
  };
};

declare global {
  interface Window {
    config: ConfigPlugin;
  }
}
