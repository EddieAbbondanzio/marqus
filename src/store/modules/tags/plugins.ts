import { persist } from "@/store/plugins/persist";
import { tagSchema } from "@/validation";
import { TagState, Tag } from "./state";
import * as yup from "yup";

// Needed to prevent circular dependencies.

persist.register({
  namespace: "tags",
  transformer: (s: TagState) => s.values,
  reviver: (values: Tag[]) => ({ values }),
  schema: yup.array().of(tagSchema)
});
