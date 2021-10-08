import { TagActions } from "@/store/modules/tags/actions";
import { TagGetters } from "@/store/modules/tags/getters";
import { TagMutations } from "@/store/modules/tags/mutations";
import { Tag, TagState } from "@/store/modules/tags/state";
import { persist } from "@/store/plugins/persist";
import { tagSchema } from "@/validation/tag-schema";
import { createComposable, Module } from "vuex-smart-module";
import * as yup from "yup";

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
  transformer: (s: TagState) => s.values,
  reviver: (values: Tag[]) => ({ values }),
  schema: yup.array().of(tagSchema)
});
