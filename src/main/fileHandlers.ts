import { UI, Section } from "../shared/domain/state";
import * as yup from "yup";
import _, {
  chain,
  cloneDeep,
  debounce,
  groupBy,
  isEqual,
  sortBy,
} from "lodash";
import { keyCodesToString, parseKeyCodes } from "../shared/io/keyCode";
import { DEFAULT_SHORTCUTS } from "../shared/io/defaultShortcuts";
import { createFileHandler } from "./fileSystem";
import { px } from "../shared/dom";
import {
  getTagSchema,
  notebookSchema,
  shortcutSchema,
} from "../shared/domain/schemas";
import { Tag, Notebook } from "../shared/domain/entities";
import { Shortcut } from "../shared/domain/valueObjects";

const appSchema = yup.object().shape({
  sidebar: yup.object().shape({
    width: yup.string().required(),
    scroll: yup.number().required().min(0),
    hidden: yup.boolean().optional(),
    filter: yup.object().shape({
      expanded: yup.boolean().optional(),
    }),
    explorer: yup.object().shape({
      view: yup
        .mixed()
        .oneOf(["all", "notebooks", "tags", "favorites", "temp", "trash"])
        .required(),
    }),
  }),
});

export const uiFile = createFileHandler<UI>("ui.json", appSchema, {
  serialize: (ui) => {
    // Nuke out stuff we don't want to persist.
    ui.sidebar.explorer.input = undefined;
    ui.sidebar.explorer.selected = undefined;
    ui.focused = undefined!;

    return ui;
  },
  deserialize: (ui) => {
    if (ui == null) {
      return;
    }

    ui.sidebar.explorer.input = undefined;
    ui.sidebar.explorer.selected = undefined;
    ui.focused = [];
    return ui;
  },
  defaultValue: {
    sidebar: {
      hidden: false,
      width: px(300),
      scroll: 0,
      filter: {},
      explorer: {
        view: "notebooks",
      },
    },
    focused: [],
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
    deserialize: (c?: Omit<Notebook, "type">[]) => {
      console.log("Need to handle nested notebooks here. Validation too");
      return (c ?? []).map((n) => ({ ...n, type: "notebook" }));
    },
  }
);

export interface ShortcutOverride {
  command: string;
  keys?: string;
  disabled?: boolean;
  when?: string;
  repeat?: boolean;
}

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
          shortcut = Object.assign({}, defaultShortcut);
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
              type: "shortcut",
              keys: parseKeyCodes(userOverride.keys),
              when: userOverride.when as Section,
            }
          );
        }

        values.push(shortcut);
      }
      return values;
    },
  }
);
