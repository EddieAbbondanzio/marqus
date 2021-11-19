import _, { cloneDeep, debounce, isEqual } from "lodash";
import * as yup from "yup";
import { px } from "../../shared/dom/units";
import {
  Notebook,
  notebookSchema,
  State,
  Tag,
  tagSchema,
} from "../../shared/domain";
import { RpcRegistry } from "../../shared/rpc";
import { readFile, writeFile } from "../fileSystem";

export const DEFAULT_STATE: State = {
  globalNavigation: {
    width: px(300),
    scroll: 0,
  },
  tags: {
    values: [],
  },
  notebooks: {
    values: [],
  },
  shortcuts: {
    values: [],
  },
};

export type FileName =
  | "tags.json"
  | "notebooks.json"
  | "shortcuts.json"
  | "ui.json";

function isValidFileName(fileName: FileName) {
  return (
    fileName === "tags.json" ||
    fileName === "notebooks.json" ||
    fileName === "ui.json" ||
    fileName === "shortcuts.json"
  );
}

const uiFile = getFileHandler<Pick<State, "globalNavigation">>(
  "ui.json",
  yup.object().shape({
    globalNavigation: yup.object().shape({
      width: yup.string().required(),
      scroll: yup.number().required().min(0),
    }),
  })
);
const tagFile = getFileHandler<Tag[]>("tags.json", yup.array(tagSchema));
const notebookFile = getFileHandler<Notebook[]>(
  "notebooks.json",
  yup.array(notebookSchema)
);

export async function load(): Promise<State> {
  const [ui, tags, notebooks] = await Promise.all([
    uiFile.load(),
    tagFile.load(),
    notebookFile.load(),
  ]);

  return {
    globalNavigation: ui.globalNavigation,
    tags: { values: tags },
    notebooks: { values: notebooks },
  };
}

export async function save(state: State): Promise<void> {
  await Promise.all([
    uiFile.save({
      globalNavigation: state.globalNavigation,
    }),
    tagFile.save(state.tags.values),
    notebookFile.save(state.notebooks.values),
  ]);
}

interface FileHandler<Content> {
  save(content: Content): Promise<Content>;
  load(): Promise<Content>;
}

const DEBOUNCE_INTERVAL = 250;

function getFileHandler<Content>(
  name: FileName,
  schema: yup.AnySchema
): FileHandler<Content> {
  if (!isValidFileName(name)) {
    throw Error(`Invalid file name ${name}`);
  }

  let previous: Content;

  const save: any = debounce(async (content: Content): Promise<Content> => {
    if (previous != null && isEqual(content, previous)) {
      return content;
    }

    await schema.validate(content);
    await writeFile(name, content, "json");
    previous = cloneDeep(content);

    return content;
  }, DEBOUNCE_INTERVAL);

  const load = async () => {
    const content = await readFile(name, "json");

    if (content != null) {
      await schema.validate(content);
    }

    return content;
  };

  return {
    save,
    load,
  };
}

export const stateRpcs: RpcRegistry = {
  "state.load": load,
  "state.save": save,
};
