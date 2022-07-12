import { DeepPartial } from "tsdef";
import { State } from "../../src/renderer/store";
import { DEFAULT_NOTE_SORTING_ALGORITHM } from "../../src/shared/domain/note";

export function createState(partial?: DeepPartial<State>): State {
  const defaults: State = {
    notes: [],
    shortcuts: [],
    tags: [],
    focused: [],
    sidebar: {
      scroll: 0,
      width: "300px",
      sort: DEFAULT_NOTE_SORTING_ALGORITHM,
    },
    editor: {
      isEditting: false,
      scroll: 0,
      tabs: [],
      tabsScroll: 0,
    },
  };

  return Object.assign(defaults, partial);
}
