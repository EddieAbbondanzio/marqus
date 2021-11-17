import { Config as ConfigType } from "../shared/rpc/config";

const { rpc } = window;

export const Config: ConfigType = {
  async load(p) {
    const c = await rpc("config.load", p);
    return c;
  },
  async save(p) {
    const c = await rpc("config.save", p);
    return c;
  },
};
