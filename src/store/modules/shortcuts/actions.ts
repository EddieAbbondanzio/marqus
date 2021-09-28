import { shortcuts } from "@/utils/shortcuts/shortcuts";
import { ShortcutGetters } from "@/store/modules/shortcuts/getters";
import { ShortcutMutations } from "@/store/modules/shortcuts/mutations";
import { ShortcutState } from "@/store/modules/shortcuts/state";
import { ActionTree, Store } from "vuex";
import { Actions } from "vuex-smart-module";

export class ShortcutActions extends Actions<
  ShortcutState,
  ShortcutGetters,
  ShortcutMutations,
  ShortcutActions
> {}
