import {
  Notebook,
  Shortcut,
  ShortcutOverride,
  Tag,
  UI,
  UISection,
} from "../shared/state";
import * as yup from "yup";
import { chain, cloneDeep, debounce, groupBy, isEqual, sortBy } from "lodash";
import { keyCodesToString, parseKeyCodes } from "../shared/io/keyCode";
import { DEFAULT_SHORTCUTS } from "../shared/io/defaultShortcuts";
import { readFile, writeFile } from "./fileSystem";
import { px } from "../shared/dom";
import {
  uiSchema,
  getTagSchema,
  notebookSchema,
  shortcutSchema,
} from "../shared/schemas";

export const uiFile = createFileHandler<UI>("ui.json", uiSchema, {
  defaultValue: {
    globalNavigation: {
      width: px(300),
      scroll: 0,
    },
  },
});

export const tagFile = createFileHandler<Tag[]>(
  "tags.json",
  yup.array(getTagSchema()).optional(),
  {
    defaultValue: [],
    serialize: (c: Tag[]) => c.map(({ type, ...t }) => t),
    deserialize: (c?: Omit<Tag, "type">[]) =>
      (c ?? []).map((t) => ({ ...t, type: "tag" })),
  }
);

export const notebookFile = createFileHandler<Notebook[]>(
  "notebooks.json",
  yup.array(notebookSchema).optional(),
  {
    defaultValue: [],
    serialize: (n: Notebook[]) => n.map(({ type, ...n }) => n),
    deserialize: (c?: Omit<Notebook, "type">[]) =>
      (c ?? []).map((n) => ({ ...n, type: "notebook" })),
  }
);

export const shortcutFile = createFileHandler<Shortcut[]>(
  "shortcuts.json",
  yup.array(shortcutSchema).optional(),
  {
    defaultValue: DEFAULT_SHORTCUTS,
    serialize: (shortcuts) =>
      shortcuts
        .filter((s) => s.userDefined)
        .map((s) => ({
          ...s,
          keys: keyCodesToString(s.keys),
        })),
    deserialize: (raw: ShortcutOverride[]) => {
      raw ??= [];

      // Is there any redundant keys?
      const duplicates = raw.filter(
        (item, index) => raw.findIndex((i) => i.keys === item.keys) != index
      );

      if (duplicates.length > 0) {
        console.error(
          "Error: Complete list of duplicate shortcuts: ",
          duplicates
        );
        throw Error(`Duplicate shortcuts for keys ${duplicates[0].keys}`);
      }

      /*
       * Custom shortcut uses cases:
       * - Disable an existing shortcut
       * - Modify the keys of an existing shortcut
       * - Modify the "when" of an existing shortuct
       * - Create a new custom shortcut
       */

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
            {
              ...userOverride,
              keys: parseKeyCodes(userOverride.keys),
              when: userOverride.when as UISection,
            }
          );
        }

        values.push(shortcut);
      }
      return values;
    },
  }
);

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

interface FileHandler<Content> {
  save(content: Content): Promise<Content>;
  load(): Promise<Content>;
}

const DEBOUNCE_INTERVAL_MS = 250;

function createFileHandler<Content>(
  /**
   * The name of the file. Should include extension (.json)
   */
  name: FileName,
  /**
   * Validation occurs before saving file contents, and after deserializing
   * when loading file contents
   */
  schema: yup.SchemaOf<Content>,
  opts?: {
    /**
     * Return value in the event the file was empty or not found.
     */
    defaultValue?: Content;
    /**
     * Convert the content of the file before saving it.
     */
    serialize?: (c: Content) => any;
    /**
     * Parse the content of the file after loading it.
     */
    deserialize?: (c?: any) => Content | undefined;
  }
): FileHandler<Content> {
  if (!isValidFileName(name)) {
    throw Error(`Invalid file name ${name}`);
  }

  let previous: Content;

  const save: any = debounce(async (content?: Content): Promise<Content> => {
    if (content == null) {
      throw Error(`${name} file content cannot be null.`);
    }

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
  }, DEBOUNCE_INTERVAL_MS);

  const load = async () => {
    // File will never change unless we save it, so we can return cached state.
    if (previous != null) {
      return previous;
    }
    const content = await readFile(name, "json");

    let c;
    if (opts?.deserialize != null) {
      c = opts.deserialize(content);
    } else {
      c = content;
    }

    if (c != null) {
      await schema.validate(c);
    } else {
      c = opts?.defaultValue;
    }

    if (c == null) {
      throw Error(
        `Content for ${name} was null and no default value was provided.`
      );
    }

    return c;
  };

  return {
    save,
    load,
  };
}
