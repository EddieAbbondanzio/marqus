import * as yup from "yup";
import { notebookSchema } from "@/validation";
import { persist } from "@/store/plugins/persist";
import { Notebook, fixNotebookParentReferences, NotebookState, killNotebookParentReferences } from "./state";

persist.register({
  namespace: "notebooks",
  reviver: (values: Notebook[]) => {
    for (const n of values) {
      fixNotebookParentReferences(n);
    }

    return { values };
  },
  transformer: (s: NotebookState) => {
    /*
     * Need to nuke .parent references before serializing or else JSON.strigify
     * will throw error due to circular references.
     */
    for (const n of s.values) {
      killNotebookParentReferences(n);
    }

    return s.values;
  },
  schema: yup.array().of(notebookSchema)
});
