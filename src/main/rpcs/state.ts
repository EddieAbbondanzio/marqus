import { px } from "../../shared/dom/units";
import { State, UI } from "../../shared/state";
import { DEFAULT_SHORTCUTS } from "../../shared/io/defaultShortcuts";
import { RpcRegistry } from "../../shared/rpc";
import { uiFile, tagFile, notebookFile, shortcutFile } from "../fileHandlers";

export async function load(): Promise<State> {
  const [ui, tags, notebooks, shortcuts] = await Promise.all([
    uiFile.load(),
    tagFile.load(),
    notebookFile.load(),
    shortcutFile.load(),
  ]);

  return {
    ui,
    tags,
    notebooks,
    shortcuts,
  };
}

export async function saveUI(ui: UI): Promise<void> {
  await uiFile.save(ui);
}

export const stateRpcs: RpcRegistry = {
  "state.load": load,
  "state.saveUI": saveUI,
};
