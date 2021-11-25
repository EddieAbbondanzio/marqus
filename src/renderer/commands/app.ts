import { Command } from "./types";

/*
 * These commands are "thin" but needed so we can support custom shortcuts
 */

const openDevTools: Command = async () => window.rpc("ui.openDevTools");
const reload: Command = async () => window.rpc("ui.reload");
const toggleFullScreen = async () => window.rpc("ui.toggleFullScreen");

export const APP_REGISTRY = {
  openDevTools,
  reload,
  toggleFullScreen,
};
