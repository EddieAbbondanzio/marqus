import { mediator } from "@/store/plugins/mediator";
// import { persist } from "@/store/plugins/persist";
import { createStore, Module } from "vuex-smart-module";
import { notebooks } from "@/store/modules/notebooks";
import { tags } from "@/store/modules/tags";
import { shortcuts } from "@/store/modules/shortcuts";
import { userInterface } from "@/store/modules/ui";
import { notes } from "@/store/modules/notes";
import { undo } from "@/store/plugins/undo";
import { createLogger } from "vuex";

// Import plugin folders to enable them
// import "./modules/tags/plugins";
// import "./modules/notebooks/plugins";
// import "./modules/notes/plugins";
// import "./modules/ui/plugins";
// import "./modules/ui/modules/command-console/plugins";
// import "./modules/ui/modules/editor/plugins";
// import "./modules/ui/modules/global-navigation/plugins";
// import "./modules/ui/modules/local-navigation/plugins";

export const root = new Module({
  namespaced: false,
  modules: {
    notebooks,
    tags,
    shortcuts,
    notes,
    ui: userInterface
  }
});

const plugins = [
  createLogger({ logActions: false }),
  // persist.plugin,
  undo.plugin,
  mediator.plugin
  // comment is kept to prevent it from going to single line
];

export const store = createStore(
  root,
  {
    plugins,
    /*
   * Don't use strict mode in production.
   * Major performance hit.
   * See: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
   */
    strict: process.env.NODE_ENV !== "production"
  }
);
