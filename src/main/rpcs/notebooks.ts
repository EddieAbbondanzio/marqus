import * as yup from "yup";
import { Notebook } from "../../shared/domain/entities";
import { notebookSchema } from "../../shared/domain/schemas";
import { createFileHandler } from "../fileSystem";

export const notebookFile = createFileHandler<Notebook[]>(
  "notebooks.json",
  yup.array(notebookSchema).optional(),
  {
    defaultValue: [],
    serialize: (n: Notebook[]) => n.map(({ type, ...n }) => n),
    deserialize: (c?: Omit<Notebook, "type">[]) => {
      console.log("Need to handle nested notebooks here. Validation too");
      return (c ?? []).map((n) => ({ ...n, type: "notebook" }));
    },
  }
);
