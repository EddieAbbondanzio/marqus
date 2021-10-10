// import { NamespacedCommand } from "@/commands";
// import { persist } from "@/store/plugins/persist";
// import { ShortcutState, Shortcut, parseKeyCodes } from "./state";

// export interface SerializedShortcut {
//   keys: string;
//   command: NamespacedCommand;
//   context?: string;
// }

// persist.register({
//   namespace: "shortcuts",
//   ignore: [
//     "SET_STATE",
//     "REMOVE_SHORTCUT_FOR_COMMAND",
//     "KEY_DOWN",
//     "KEY_UP",
//     "CREATE_SHORTCUT",
//   ],
//   transformer: (state: ShortcutState): SerializedShortcut[] => {
//     const shortcutMappings = [];

//     for (const [keys, mappings] of Object.entries(state.map)) {
//       for (const { command, context } of mappings) {
//         // Skip default ones
//         if (!state.invertedMap[command].userDefined) {
//           continue;
//         }

//         shortcutMappings.push({ keys, command, context });
//       }
//     }

//     return shortcutMappings;
//   },
//   reviver: (values: SerializedShortcut[]): Shortcut[] => {
//     return values.map((v: SerializedShortcut) => ({
//       ...v,
//       keys: parseKeyCodes(v.keys),
//       userDefined: true,
//     }));
//   },
// });
