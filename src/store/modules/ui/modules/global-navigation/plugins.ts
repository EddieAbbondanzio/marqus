import { undo } from "@/store/plugins/undo";
import { RecursivePartial } from "@/utils";
import { GlobalNavigationState } from "./state";

undo.registerContext({
  name: "globalNavigation",
  namespace: "ui/globalNavigation",
  setStateTransformer: (state: RecursivePartial<GlobalNavigationState>) => {
    // Nuke out visual state so we don't accidentally overwrite it.
    delete state.width;
    return state;
  }
});
