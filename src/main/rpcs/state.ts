import { State, UI } from "../../shared/domain/state";
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
  /*
   * We only allow saving the UI file because every other file have their
   * contents saved in context specific rpcs. For example, the tag file
   * will be saved after every CRUD action like tag.create, tag.delete, etc...
   */
  await uiFile.save(ui);
}

export const stateRpcs: RpcRegistry = {
  "state.load": load,
  "state.saveUI": saveUI,
};
