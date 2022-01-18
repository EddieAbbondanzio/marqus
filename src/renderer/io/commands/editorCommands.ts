import { CommandsForNamespace } from "./types";

export const editorCommands: CommandsForNamespace<"editor"> = {
  "editor.focus": async (ctx) => {
    ctx.setUI({
      focused: ["editor"],
    });
    console.log("Focus editor");

    // Temp hack to de blur anything
  },
};
