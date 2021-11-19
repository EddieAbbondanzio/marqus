import _, { cloneDeep, debounce, isEqual, over } from "lodash";
import * as yup from "yup";
import { px } from "../../shared/dom/units";
import {
  Notebook,
  Notebooks,
  notebookSchema,
  ShortcutOverride,
  shortcutSchema,
  Shortcuts,
  State,
  Tag,
  Tags,
  tagSchema,
  UI,
  uiSchema,
  Shortcut,
} from "../../shared/domain";
import { DEFAULT_SHORTCUTS } from "../../shared/io/defaultShortcuts";
import {
  keyCodesToString,
  parseKeyCode,
  parseKeyCodes,
} from "../../shared/io/keyCode";
import { RpcRegistry } from "../../shared/rpc";
import { readFile, writeFile } from "../fileSystem";

export const DEFAULT_STATE: State = {
  ui: {
    globalNavigation: {
      width: px(300),
      scroll: 0,
    },
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

export async function load(): Promise<State> {
  const [ui, tags, notebooks, shortcuts] = await Promise.all([
    uiFile.load(),
    tagFile.load(),
    notebookFile.load(),
    shortcutFile.load(),
  ]);

  return {
    ui,
    tags,
    notebooks,
    shortcuts,
  };
}

export async function save(state: State): Promise<void> {
  const { ui, tags, notebooks } = state;

  await Promise.all([
    uiFile.save(ui),
    tagFile.save(tags),
    notebookFile.save(notebooks),
  ]);
}

const uiFile = createFileHandler<UI>("ui.json", uiSchema);
const tagFile = createFileHandler<Tags>(
  "tags.json",
  yup.object().shape({
    values: yup.array(tagSchema).optional(),
  }),
  {
    serialize: (n) => n.values,
    deserialize: (c) => ({ values: c ?? [] }),
  }
);
const notebookFile = createFileHandler<Notebooks>(
  "notebooks.json",
  yup.object().shape({
    values: yup.array(notebookSchema).optional(),
  }),
  {
    serialize: (n) => n.values,
    deserialize: (c) => ({ values: c ?? [] }),
  }
);
const shortcutFile = createFileHandler<Shortcuts>(
  "shortcuts.json",
  yup.object().shape({
    values: yup.array(shortcutSchema).optional(),
  }),
  {
    serialize: (shortcuts) =>
      shortcuts.values
        .filter((s) => s.userDefined)
        .map((s) => ({
          ...s,
          keys: keyCodesToString(s.keys),
        })),
    deserialize: (raw: ShortcutOverride[]) => {
      if (raw == null || raw.length === 0) {
        return { values: [] };
      }

      // Is there any redundant keys?
      const duplicates = raw.filter(
        (item, index) => raw.findIndex((i) => i.keys === item.keys) != index
      );

      if (duplicates.length > 0) {
        console.log(
          "Error: Complete list of duplicate shortcuts: ",
          duplicates
        );
        throw Error(`Duplicate shortcuts for keys ${duplicates[0].keys}`);
      }

      const values = [];
      for (const defaultShortcut of DEFAULT_SHORTCUTS) {
        const userOverride = raw.find(
          (s) => s.command === defaultShortcut.command
        );

        let shortcut: Shortcut;

        if (userOverride == null) {
          shortcut = Object.assign({}, defaultShortcut, userOverride);
        } else {
          // Validate it has keys if it's new.
          if (userOverride.keys == null) {
            throw Error(
              `User defined shortcut for ${userOverride.command} does not have any keys specified`
            );
          }

          shortcut = Object.assign(
            {},
            { ...userOverride, keys: parseKeyCodes(userOverride.keys) }
          );
        }

        values.push(shortcut);
      }

      return { values };
    },
  }
);

interface FileHandler<Content> {
  save(content: Content): Promise<Content>;
  load(): Promise<Content>;
}

const DEBOUNCE_INTERVAL = 250;

function createFileHandler<Content>(
  name: FileName,
  schema: yup.SchemaOf<Content>,
  opts?: { serialize?: (c: Content) => any; deserialize?: (c: any) => Content }
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

    let c;
    if (opts?.serialize != null) {
      c = opts.serialize(content);
    } else {
      c = content;
    }

    await writeFile(name, c, "json");
    previous = cloneDeep(content);

    return content;
  }, DEBOUNCE_INTERVAL);

  const load = async () => {
    const content = await readFile(name, "json");

    let c;
    if (opts?.deserialize != null) {
      c = opts.deserialize(content);
    } else {
      c = content;
    }

    if (c != null) {
      await schema.validate(c);
    }

    return c;
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
