import { TagActions } from "@/store/modules/tags/actions";
import { TagGetters } from "@/store/modules/tags/getters";
import { TagMutations } from "@/store/modules/tags/mutations";
import { TagState } from "@/store/modules/tags/state";
import { persist } from "@/store/plugins/persist/persist";
import { createComposable, Module } from "vuex-smart-module";

export const tags = new Module({
  namespaced: true,
  state: TagState,
  getters: TagGetters,
  mutations: TagMutations,
  actions: TagActions
});

export const useTags = createComposable(tags);

persist.register({
  namespace: "tags",
  setStateAction: "setState",
  ignore: ["SET_STATE"]
});
