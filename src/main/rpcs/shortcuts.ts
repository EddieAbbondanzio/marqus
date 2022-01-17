import { RpcRegistry } from "../../shared/rpc";
import { shortcutFile } from "../fileHandlers";

export const shortcutRpcs: RpcRegistry = {
  "shortcuts.getAll": () => shortcutFile.load(),
};
