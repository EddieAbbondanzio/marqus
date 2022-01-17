import { CommandsForNamespace } from "./types";

export const editorCommands: CommandsForNamespace<"editor"> = {
  "editor.focus": async (setUI) => {
    setUI({
      focused: ["editor"],
    });
    console.log("Focus editor");

    // Temp hack to de blur anything
  },
};
