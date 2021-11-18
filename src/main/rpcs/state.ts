// import _, { cloneDeep, isEqual } from "lodash";
// import * as yup from "yup";
// import { State } from "./domain/state";
// import { TAG_SCHEMA } from "./domain/tag";

// let previousSave: State;

// export async function loadState(): Promise<State> {
//   throw Error();
// }

// export async function saveState(state: State): Promise<void> {
//   /*
//    * Check to see if the state is different than the previous version we
//    * saved off. No sense in writing to file unless things are different.
//    */

//   if (isEqual()) previousSave = cloneDeep(state);
// }

// enum FileName {
//   TAGS = "tags.json",
//   NOTEBOOKS = "notebooks.json",
//   SHORTCUTS = "shortcuts.json",
//   UI = "ui.json",
// }

// const TAG_FILE_SCHEMA = yup.array(TAG_SCHEMA);
