import { appStateV1 } from "./1_initialDefinition";
import { appStateV2 } from "./2_addViewState";
import { appStateV3 } from "./3_addIsPinned";

export const APP_STATE_SCHEMAS = {
  1: appStateV1,
  2: appStateV2,
  3: appStateV3,
};
