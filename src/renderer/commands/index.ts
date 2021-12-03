// /* eslint-disable no-useless-constructor */

// import _ from "lodash";
// import { RefObject, useRef } from "react";
// import { State } from "../../shared/state";
// import { SaveState } from "../App";
// import { APP_REGISTRY } from "./app";
// import { GLOBAL_NAVIGATION_REGISTRY } from "./globalNavigation";
// import { Command } from "./types";

// /**
//  * Prefix a namespace to every property name delimited via a period.
//  */
// type Namespaced<N extends string, T> = {
//   [K in Extract<keyof T, string> as `${N}.${K}`]: T[K];
// };


// export const COMMAND_REGISTRY = {
//   ...namespace("globalNavigation", GLOBAL_NAVIGATION_REGISTRY),
//   ...namespace("app", APP_REGISTRY),
// };

// export type CommandRegistry = typeof COMMAND_REGISTRY;
// export type CommandName = keyof CommandRegistry;

// export type Execute = <
//   Name extends CommandName,
//   Payload extends Parameters<CommandRegistry[Name]>[1]
// >(
//   command: Name,
//   payload: Payload
// ) => Promise<void>;

// export function useCommands(s: State, save: SaveState): Execute {
//   const state = useRef(s);
//   const saveState = useRef(save);

//   return async (name, payload: any) => {
//     const command: Command<any> = COMMAND_REGISTRY[name];

//     if (command == null) {
//       throw Error(`No command ${name} registered.`);
//     }

//     let rollbackCopy = _.cloneDeep(state.current!);

//     /**
//      * Apply local changes made to state from a command.
//      * @param newState The new application state to save.
//      */
//     const commit = async (newState: State): Promise<void> => {
//       console.log("commit: ", newState);
//       await saveState.current!(newState);
//     };

//     /**
//      * Revert local changes made by a command.
//      */
//     const rollback = async (): Promise<void> => {
//       console.log("rollback: ", rollbackCopy);
//       await saveState.current!(rollbackCopy);
//     };

//     await command({ state: state.current!, commit, rollback }, payload);
//   };
// }
