import { DeepPartial } from "tsdef";
import { Config } from "../../src/shared/domain/config";

export function createConfig(partial?: DeepPartial<Config>): Config {
  const defaults: Pick<
    Config,
    "windowHeight" | "windowWidth" | "dataDirectory"
  > = {
    windowHeight: 800,
    windowWidth: 600,
    dataDirectory: "/data",
  };

  return new Config(
    partial?.windowHeight ?? defaults.windowHeight,
    partial?.windowWidth ?? defaults.windowHeight,
    partial?.dataDirectory ?? defaults.dataDirectory
  );
}
