import { TagGetters } from "@/store/modules/tags/getters";
import { TagMutations } from "@/store/modules/tags/mutations";
import { Actions } from "vuex-smart-module";
import { TagState } from "./state";

export class TagActions extends Actions<
  TagState,
  TagGetters,
  TagMutations,
  TagActions
> {}
