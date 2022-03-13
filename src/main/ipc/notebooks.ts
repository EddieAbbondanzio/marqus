import * as yup from "yup";
import {
  addChild,
  createNotebook,
  getNotebookById,
  getNotebookSchema,
  Notebook,
  removeChild,
} from "../../shared/domain/notebook";
import { IpcHandler, IpcRegistry } from "../../shared/ipc";
import { createFileHandler, getPathInDataDirectory } from "../fileHandler";
import { NotFoundError } from "../../shared/errors";
import moment from "moment";
import { Config } from "../../shared/domain/config";
import { IpcPlugin } from "../types";

export const NOTEBOOKS_FILE = "notebooks.json";

export const useNotebookIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle("notebooks.getAll", async () =>
    getNotebookFileHandler(config).load()
  );

  ipc.handle("notebooks.create", async ({ name, parentId }) => {
    const notebookFile = getNotebookFileHandler(config);
    const notebooks = await notebookFile.load();
    if (notebooks.some((n) => n.name === name)) {
      throw Error(`Notebook name ${name} already in use`);
    }

    const notebook = createNotebook({
      name,
    });

    if (parentId != null) {
      let parent = getNotebookById(notebooks, parentId);
      addChild(parent, notebook);
    } else {
      notebooks.push(notebook);
    }

    await notebookFile.save(notebooks);
    return notebook;
  });

  ipc.handle("notebooks.rename", async ({ id, name, parentId }) => {
    const notebookFile = getNotebookFileHandler(config);
    const notebooks = await notebookFile.load();
    const notebook = getNotebookById(notebooks, id);

    notebook.name = name;
    notebook.dateUpdated = new Date();

    await notebookFile.save(notebooks);
    return notebook;
  });

  ipc.handle("notebooks.delete", async ({ id }) => {
    const notebookFile = getNotebookFileHandler(config);
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
  });
};

export type SerializedNotebook = Omit<
  Notebook,
  "type" | "parent" | "children"
> & { children?: SerializedNotebook[] };

export const serialize = (n: Notebook): SerializedNotebook => {
  // Remove type / parent props
  const { type, parent, children, ...serializeProps } = n;

  // Recursively handle children
  let serializedChildren: SerializedNotebook[] | undefined;
  if (children != null && children.length > 0) {
    serializedChildren = children.map((c) => serialize(c));
  }

  return {
    ...serializeProps,
    children: serializedChildren,
  };
};

export const deserialize = (
  n: SerializedNotebook,
  parent?: Notebook
): Notebook => {
  let { children, dateCreated, dateUpdated, ...props } = n;

  let notebook: Notebook = {
    type: "notebook",
    parent,
    ...props,
    dateCreated: moment(dateCreated).toDate(),
  };

  if (n.children != null && n.children.length > 0) {
    notebook.children = n.children.map((child) => deserialize(child, notebook));
  }
  if (dateUpdated != null) {
    notebook.dateUpdated = new Date(dateUpdated);
  }

  return notebook;
};

export function getNotebookFileHandler(config: Config) {
  const filePath = getPathInDataDirectory(config, NOTEBOOKS_FILE);
  return createFileHandler<Notebook[]>(
    filePath,
    yup.array(getNotebookSchema()).optional(),
    {
      defaultValue: [],
      serialize: (notebooks) => (notebooks ?? []).map(serialize),
      deserialize: (notebooks) =>
        (notebooks ?? []).map((n: SerializedNotebook) => deserialize(n)),
    }
  );
}
