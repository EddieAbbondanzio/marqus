import { configSchemaV1 } from "./1_initialDefinition";
import { configSchemaV2 } from "./2_addLogDirectory";
import { configSchemaV3 } from "./3_addDeveloperMode";
import { configSchemaV4 } from "./4_addAutoHideAppMenu";
import { configSchemaV5 } from "./5_renameNoteDirectory";
import { configSchemaV6 } from "./6_addTabSize";

export const CONFIG_SCHEMAS = {
  1: configSchemaV1,
  2: configSchemaV2,
  3: configSchemaV3,
  4: configSchemaV4,
  5: configSchemaV5,
  6: configSchemaV6,
};
