import { configSchemaV1 } from "./1_initialDefinition";
import { configSchemaV2 } from "./2_addLogDirectory";

export const CONFIG_SCHEMAS = {
  1: configSchemaV1,
  2: configSchemaV2,
};
