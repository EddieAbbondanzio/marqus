import { DeepPartial } from "tsdef";
import { State } from "../../src/renderer/store";
import { px } from "../../src/shared/dom";

export function createState(partial?: DeepPartial<State>): State {
  const defaults: State = {
    notes: [],
    shortcuts: [],
    tags: [],
    ui: {
      focused: [],
      sidebar: {
        scroll: 0,
        width: px(300),
      },
      editor: {
        isEditting: false,
        scroll: 0,
      },
    },
  };

  return Object.assign(defaults, partial);
}
