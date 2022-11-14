import { configSchemaV1 } from "./1_initialDefinition";
import { configSchemaV2 } from "./2_addLogDirectory";
import { configSchemaV3 } from "./3_addDeveloperMode";

export const CONFIG_SCHEMAS = {
  1: configSchemaV1,
  2: configSchemaV2,
  3: configSchemaV3,
};
