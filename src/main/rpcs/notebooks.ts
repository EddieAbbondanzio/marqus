import * as yup from "yup";
import { string } from "yup/lib/locale";
import { Notebook } from "../../shared/domain/entities";
import { notebookSchema } from "../../shared/domain/schemas";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { createFileHandler } from "../fileSystem";

const getAll = async (): Promise<Notebook[]> => notebookFile.load();

const createNotebook: RpcHandler<"notebooks.create"> = async ({ name }) => {
  throw Error();
};

const updateNotebook: RpcHandler<"notebooks.update"> = async ({ id, name }) => {
  throw Error();
};

const deleteNotebook: RpcHandler<"notebooks.delete"> = async ({ id }) => {
  throw Error();
};

export const notebooksRpcs: RpcRegistry<"notebooks"> = {
  "notebooks.getAll": getAll,
  "notebooks.create": createNotebook,
  "notebooks.update": updateNotebook,
  "notebooks.delete": deleteNotebook,
};

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
