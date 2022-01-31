import * as yup from "yup";
import { string } from "yup/lib/locale";
import { Notebook } from "../../shared/domain/notebook";
import { notebookSchema } from "../../shared/domain/schemas";
import { uuid } from "../../shared/domain/utils";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { createFileHandler } from "../fileSystem";

const getAll = async (): Promise<Notebook[]> => notebookFile.load();

const createNotebook: RpcHandler<"notebooks.create"> = async ({ name }) => {
  const notebooks = await notebookFile.load();
  if (notebooks.some((n) => n.name === name)) {
    throw Error(`Notebook name ${name} already in use`);
  }

  const notebook: Notebook = {
    id: uuid(),
    type: "notebook",
    name,
    dateCreated: new Date(),
  };

  notebooks.push(notebook);
  await notebookFile.save(notebooks);

  return notebook;
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
