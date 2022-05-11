import { DeepPartial } from "tsdef";
import { Config } from "../../src/shared/domain/config";

export function createConfig(partial?: DeepPartial<Config>): Config {
  const defaults: Config = {
    windowHeight: 800,
    windowWidth: 600,
    dataDirectory: "/data",
  };

  return Object.assign(defaults, partial);
}
