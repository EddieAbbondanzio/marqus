// import { generateId, Tag } from "../../shared/state";
// import { InvalidOpError } from "../../shared/errors";
// import { createConfirmOrCancel } from "../io/confirmOrCancel";
// import { Command } from "../io/commands";

// const focus: Command = async ({ dispatch, getState }) => {
//   state.ui.focused = "globalNavigation";
//   await commit(state);
// };

// /**
//  * Resize global navigation width.
//  * @param newWidth New width string ex: '120px'
//  */
// const resizeWidth: Command<string> = async ({ commit, state }, newWidth) => {
//   if (newWidth == null) {
//     throw Error();
//   }

//   state.ui.globalNavigation.width = newWidth;
//   await commit(state);
// };

// /**
//  * Update the current scroll position.
//  * @param newScroll The new scroll position.
//  */
// const updateScroll: Command<number> = async ({ commit, state }, newScroll) => {
//   if (newScroll == null) {
//     throw Error();
//   }

//   state.ui.globalNavigation.scroll = Math.max(newScroll, 0);
//   await commit(state);
// };

// const scrollDown: Command<number> = async (
//   { commit, state },
//   increment = 30
// ) => {
//   const newScroll = Math.max(state.ui.globalNavigation.scroll + increment, 0);
//   state.ui.globalNavigation.scroll = newScroll;

//   await commit(state);
// };

// const scrollUp: Command<number> = async ({ commit, state }, increment = 30) => {
//   const newScroll = Math.max(state.ui.globalNavigation.scroll - increment, 0);
//   state.ui.globalNavigation.scroll = newScroll;

//   await commit(state);
// };

// const createTag: Command = async ({ commit, rollback, state }) => {
//   // Don't allow duplicate calls
//   // if (state.tags.input != null) {
//   //   return;
//   // }

//   console.log("createTag()");

//   // Enable user input
//   let [confirm, cancel, response] = createConfirmOrCancel();
//   state.tags.input = {
//     mode: "create",
//     value: "",
//     confirm: confirm,
//     cancel: cancel,
//   };
//   await commit(state);

//   // Create new tag, or cancel.
//   const [outcome, value] = await response;
//   switch (outcome) {
//     case "confirm":
//       console.log(`confirm create tag: value from confirm: ${value}`);
//       const tag: Tag = {
//         id: generateId(),
//         name: value!,
//         dateCreated: new Date(),
//       };

//       state.tags.input = undefined;
//       state.tags.values = [...state.tags.values, tag];
//       await commit(state);
//       break;

//     case "cancel":
//       state.tags.input = undefined;
//       await commit(state);
//       break;

//     default:
//       throw new InvalidOpError(`Invalid input response ${outcome}`);
//   }
// };

// export const GLOBAL_NAVIGATION_REGISTRY = {
//   focus,
//   resizeWidth,
//   updateScroll,
//   scrollDown,
//   scrollUp,
//   createTag,
// };
