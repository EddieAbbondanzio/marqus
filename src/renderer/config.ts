import { Config as ConfigType } from "../shared/ipc/config";

const { sendIpc } = window;

export const Config: ConfigType = {
  async load(p) {
    const c = await sendIpc("config.load", p);
    return c;
  },
  async save(p) {
    const c = await sendIpc("config.save", p);
    return c;
  },
};
