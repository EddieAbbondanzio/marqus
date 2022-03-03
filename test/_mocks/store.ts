import { renderHook } from "@testing-library/react-hooks";
import { DeepPartial } from "tsdef";
import { StoreControls, useStore } from "../../src/renderer/store";
import { px } from "../../src/shared/dom";
import { State } from "../../src/shared/domain/state";

export function createState(partial?: DeepPartial<State>) {
  const defaults: State = {
    notebooks: [],
    notes: [],
    shortcuts: [],
    tags: [],
    ui: {
      focused: [],
      sidebar: {
        explorer: {
          view: "all",
        },
        filter: {},
        scroll: 0,
        width: px(300),
      },
    },
  };

  return Object.assign(defaults, partial);
}

export function renderStoreHook(state?: DeepPartial<State>) {
  return renderHook(() => useStore(createState(state)));
}
