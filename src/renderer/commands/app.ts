import { Command } from "./types";

const openDevTools: Command = async () => {
  window.rpc("ui.openDevTools");
};

export const APP_REGISTRY = {
  openDevTools,
};
