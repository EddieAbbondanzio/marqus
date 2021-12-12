import { CommandsForNamespace } from "./types";

const { rpc } = window;
export const appCommands: CommandsForNamespace<"app"> = {
  "app.openDevTools": async () => rpc("app.openDevTools"),
  "app.reload": async () => rpc("app.reload"),
  "app.toggleFullScreen": async () => rpc("app.toggleFullScreen"),
  "app.inspectElement": async (_, coord) => {
    console.log("inspect: ", coord);
    rpc("app.inspectElement", coord!);
  },
};
