import { CommandRegistry } from "./types";
const { rpc } = window;

export const appCommands: CommandRegistry = {
  "app.openDevTools": async () => rpc("app.openDevTools"),
  "app.reload": async () => rpc("app.reload"),
  "app.toggleFullScreen": async () => rpc("app.toggleFullScreen"),
};
