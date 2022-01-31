import * as yup from "yup";
import { string } from "yup/lib/locale";
import {
  getNotebookById,
  Notebook,
  notebookSchema,
  removeChild,
} from "../../shared/domain/notebook";
import { uuid } from "../../shared/domain/id";
import { RpcHandler, RpcRegistry } from "../../shared/rpc";
import { createFileHandler } from "../fileSystem";
import { NotFoundError } from "../../shared/errors";

const getAll = async (): Promise<Notebook[]> => notebookFile.load();

const createNotebook: RpcHandler<"notebooks.create"> = async ({
  name,
  parentId,
}) => {
  const notebooks = await notebookFile.load();
  if (notebooks.some((n) => n.name === name)) {
    throw Error(`Notebook name ${name} already in use`);
  }

  let parent;
  if (parentId != null) {
    parent = getNotebookById(notebooks, parentId);
  }

  const notebook: Notebook = {
    id: uuid(),
    type: "notebook",
    name,
    dateCreated: new Date(),
    parent,
  };

  notebooks.push(notebook);
  await notebookFile.save(notebooks);

  return notebook;
};

const updateNotebook: RpcHandler<"notebooks.update"> = async ({
  id,
  name,
  parentId,
}) => {
  const notebooks = await notebookFile.load();
  const notebook = getNotebookById(notebooks, id);

  // Allow switching parents
  if (parentId != null) {
    let parent = getNotebookById(notebooks, parentId);
    notebook.parent = parent;
  }

  notebook.name = name;
  notebook.dateUpdated = new Date();

  await notebookFile.save(notebooks);
  return notebook;
};

const deleteNotebook: RpcHandler<"notebooks.delete"> = async ({ id }) => {
  const notebooks = await notebookFile.load();
  const notebook = getNotebookById(notebooks, id);

  if (notebook.parent != null) {
    removeChild(notebook.parent, notebook);
  } else {
    const index = notebooks.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new NotFoundError(`No notebook with id ${id} found`);
    }

    notebooks.splice(index, 1);
  }

  await notebookFile.save(notebooks);
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
