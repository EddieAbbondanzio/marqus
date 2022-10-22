import { DeepPartial } from "tsdef";
import { Config } from "../../src/shared/domain/config";

export function createConfig(partial?: DeepPartial<Config>): Config {
  return {
    version: partial?.version ?? 1,
    logDirectory: partial?.logDirectory ?? "/logs",
    windowHeight: partial?.windowHeight ?? 600,
    windowWidth: partial?.windowWidth ?? 800,
    dataDirectory: partial?.dataDirectory ?? "/data",
  };
}
