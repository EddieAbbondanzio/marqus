import _, { cloneDeep, debounce, isEqual } from "lodash";
import * as yup from "yup";
import {
  Notebook,
  notebookSchema,
  State,
  Tag,
  tagSchema,
} from "../../shared/domain";
import { RpcRegistry } from "../../shared/rpc";
import { readFile, writeFile } from "../fileSystem";

export type FileName =
  | "tags.json"
  | "notebooks.json"
  | "shortcuts.json"
  | "ui.json";

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
  load(opts?: { required: boolean }): Promise<Content>;
}

function getFileHandler<Content>(
  name: FileName,
  schema: yup.AnySchema
): FileHandler<Content> {
  let previous: Content;

  const save: any = async (content: Content): Promise<Content> => {
    if (previous != null && isEqual(content, previous)) {
      return content;
    }

    await schema.validate(content);
    await writeFile(name, content, "json");
    previous = cloneDeep(content);

    return content;
  };

  const load = async (opts?: { required: boolean }) => {
    const content = await readFile(name, "json", opts);

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
