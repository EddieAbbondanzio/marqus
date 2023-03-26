import { DeepPartial } from "tsdef";
import { State } from "../../src/renderer/store";
import { DEFAULT_NOTE_SORTING_ALGORITHM } from "../../src/shared/domain/note";
import { getLatestSchemaVersion } from "../../src/main/schemas/utils";
import { APP_STATE_SCHEMAS } from "../../src/main/schemas/appState";
import { cloneDeep, omit } from "lodash";
import { AppState, Cache } from "../../src/shared/ui/app";

const latestVersion = getLatestSchemaVersion(APP_STATE_SCHEMAS);

export function createState(partial?: DeepPartial<State>): State {
  const cloned = cloneDeep(partial ?? {});
  cloned.version ??= latestVersion;

  cloned.focused ??= [];

  cloned.sidebar ??= {};
  cloned.sidebar.scroll ??= 0;
  cloned.sidebar.width ??= "300px";
  cloned.sidebar.sort ??= DEFAULT_NOTE_SORTING_ALGORITHM;

  cloned.editor ??= {};
  cloned.editor.isEditing ??= false;
  cloned.editor.scroll ??= 0;
  cloned.editor.tabs ??= [];
  cloned.editor.tabsScroll ??= 0;

  cloned.shortcuts ??= [];
  cloned.notes ??= [];

  return cloned as State;
}

export function createAppState(partial?: DeepPartial<AppState>): AppState {
  const state = createState(partial);
  return omit(state, "notes", "shortcuts");
}

export function createCache(partial?: Partial<Cache>): Cache {
  return {
    modelViewStates: partial?.modelViewStates ?? {},
  };
}
