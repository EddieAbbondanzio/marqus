import { createAwaitableInput } from "../../../shared/awaitableInput";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace, ExecutionContext } from "./types";
import * as yup from "yup";
import { NotFoundError, NotImplementedError } from "../../../shared/errors";
import { ExplorerView } from "../../../shared/domain/state";
import { clamp, create, head } from "lodash";
import { globalId, parseGlobalId } from "../../../shared/domain/id";
import { getExplorerItems } from "../../components/Explorer";
import { getNoteById, getNoteSchema, Note } from "../../../shared/domain/note";
import { getTagById, getTagSchema, Tag } from "../../../shared/domain/tag";
import {
  addChild,
  getNotebookById,
  getNotebookSchema,
  Notebook,
  removeChild,
} from "../../../shared/domain/notebook";

export const sidebarCommands: CommandsForNamespace<"sidebar"> = {
  "sidebar.focus": async (ctx) => {
    ctx.setUI({
      focused: ["sidebar"],
    });
    console.log("set focus to sidebar");
  },
  "sidebar.toggle": async (ctx) => {
    ctx.setUI((prev) => ({
      sidebar: {
        hidden: !(prev.sidebar.hidden ?? false),
      },
    }));
  },
  "sidebar.resizeWidth": async (ctx, width) => {
    if (width == null) {
      return;
    }

    ctx.setUI({
      sidebar: {
        width,
      },
    });
  },
  "sidebar.updateScroll": async (ctx, scroll) => {
    if (scroll == null) {
      return;
    }

    ctx.setUI({
      sidebar: {
        scroll,
      },
    });
  },
  "sidebar.scrollDown": async (ctx) => {
    ctx.setUI((prev) => {
      // Max scroll clamp is performed in scrollable.
      const scroll = prev.sidebar.scroll + 30;
      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.scrollUp": async (ctx) => {
    ctx.setUI((prev) => {
      const scroll = Math.max(prev.sidebar.scroll - 30, 0);
      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.toggleFilter": async (ctx) => {
    ctx.setUI((prev) => {
      return {
        sidebar: {
          filter: {
            expanded: !prev.sidebar.filter.expanded,
          },
        },
      };
    });
  },
  "sidebar.createTag": async (ctx) => {
    let { tags } = ctx.getState();
    let schema: yup.StringSchema = yup.reach(getTagSchema(tags), "name");

    let [input, completed] = createAwaitableInput(
      { value: "", schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input,
          view: "tags",
        },
      },
    });

    const [value, action] = await completed;
    if (action === "confirm") {
      try {
        const tag = await window.rpc("tags.create", { name: value });
        ctx.setTags((tags) => [...tags, tag]);
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.renameTag": async (ctx, id) => {
    let { tags } = ctx.getState();
    const otherTags = tags.filter((t) => t.id !== id);
    let schema: yup.StringSchema = yup.reach(getTagSchema(otherTags), "name");

    const tag = getTagById(tags, id!);
    let [input, completed] = createAwaitableInput(
      { value: tag.name, id: tag.id, schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input,
          view: "tags",
        },
      },
    });

    const [name, action] = await completed;
    if (action === "confirm") {
      try {
        const updated = await window.rpc("tags.update", { id: tag.id, name });
        ctx.setTags((tags) => {
          const index = tags.findIndex((t) => t.id === id);
          tags[index] = updated;
          return tags;
        });
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.deleteTag": async (ctx, id) => {
    const { tags } = ctx.getState();
    const tag = getTagById(tags, id!);
    const res = await promptConfirmAction("delete", `tag ${tag.name}`);

    if (res.text === "Yes") {
      await window.rpc("tags.delete", { id: tag.id });
      ctx.setTags((tags) => tags.filter((t) => t.id !== tag.id));
    }
  },
  "sidebar.createNotebook": async (ctx) => {
    const state = ctx.getState();
    const { selected } = state.ui.sidebar.explorer;

    let parentId: string | undefined;
    if (selected != null && selected.length > 0) {
      const [type, id] = parseGlobalId(selected[0]);
      if (type === "notebook") {
        parentId = id;
      }
    }

    let siblings =
      parentId == null
        ? state.notebooks
        : getNotebookById(state.notebooks, parentId).children!;
    let schema: yup.StringSchema = yup.reach(
      getNotebookSchema(siblings),
      "name"
    );

    let [input, completed] = createAwaitableInput(
      { value: "", schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    let parentGlobalId =
      parentId != null ? globalId("notebook", parentId) : undefined;
    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input: {
            ...input,
            parentGlobalId,
          },
          view: "notebooks",
        },
      },
    });

    const [value, action] = await completed;
    if (action === "confirm") {
      try {
        const notebook = await window.rpc("notebooks.create", {
          name: value,
          parentId,
        });
        ctx.setNotebooks((notebooks) => {
          if (parentId != null) {
            const parent = getNotebookById(notebooks, parentId);
            addChild(parent, notebook);
            return [...notebooks];
          } else {
            return [...notebooks, notebook];
          }
        });
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.renameNotebook": async (ctx, id) => {
    const state = ctx.getState();
    let notebook = getNotebookById(state.notebooks, id!);
    let siblings = (notebook.parent?.children ?? state.notebooks).filter(
      (n) => n.id !== id!
    );

    let schema: yup.StringSchema = yup.reach(
      getNotebookSchema(siblings),
      "name"
    );

    let [input, completed] = createAwaitableInput(
      { value: notebook.name, id: notebook.id, schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input,
          view: "notebooks",
        },
      },
    });

    const [value, action] = await completed;
    if (action === "confirm") {
      try {
        const renamed = await window.rpc("notebooks.update", {
          id: notebook.id,
          name: value,
        });
        ctx.setNotebooks((notebooks) => {
          if (notebook.parent == null) {
            const index = notebooks.findIndex((n) => n.id === renamed.id);
            notebooks.splice(index, 1, renamed);
            console.log("renamed: ", renamed);
          } else {
            const parent = notebook.parent;
            const index = parent.children!.findIndex(
              (n) => n.id === renamed.id
            );
            parent.children!.splice(index, 1, renamed);
            renamed.parent = parent;
          }

          return [...notebooks];
        });
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.deleteNotebook": async (ctx, id) => {
    const { notebooks } = ctx.getState();
    const notebook = getNotebookById(notebooks, id!);
    const res = await promptConfirmAction(
      "delete",
      `notebook ${notebook.name}`
    );

    if (res.text === "Yes") {
      await window.rpc("notebooks.delete", { id: notebook.id });
      ctx.setNotebooks((notebooks) => {
        if (notebook.parent != null) {
          // notebook.parent will be a stale reference
          const parent = getNotebookById(notebooks, notebook.parent.id);
          removeChild(parent, notebook);
          return [...notebooks];
        } else {
          return notebooks.filter((n) => n.id !== notebook.id);
        }
      });
    }
  },
  "sidebar.createNote": async (ctx) => {
    let state = ctx.getState();
    let schema: yup.StringSchema = yup.reach(
      getNoteSchema(state.notes),
      "name"
    );

    let [input, completed] = createAwaitableInput(
      { value: "", schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    // TODO: Add multi-select support
    const { selected } = state.ui.sidebar.explorer;
    let view: ExplorerView = "all";
    let tag;
    let notebook;
    let parentId;
    if (selected != null && selected.length > 0) {
      const firstSelected = head(selected)!;
      const [type, id] = parseGlobalId(firstSelected);
      parentId = firstSelected;

      switch (type) {
        case "notebook":
          view = "notebooks";
          notebook = id;
          break;

        case "tag":
          view = "tags";
          tag = id;
          break;
      }
    }

    // TODO: We'll need to allow creating notes in any view (except trash)
    // Note created in view == "tags" -> add tag to it
    // Note created in view == "notebooks" -> add notebook to it.
    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input: {
            ...input,
            parentGlobalId: parentId,
          },
          view,
        },
      },
    });

    const [value, action] = await completed;
    if (action === "confirm") {
      try {
        const note = await window.rpc("notes.create", {
          name: value,
          notebook,
          tag,
        });
        ctx.setNotes((notes) => [...notes, note]);
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.renameNote": async (ctx, id) => {
    const { notes } = ctx.getState();
    let note = getNoteById(notes, id!);
    let schema: yup.StringSchema = yup.reach(getNoteSchema(notes), "name");

    let [input, completed] = createAwaitableInput(
      { value: note.name, id: note.id, schema },
      (value) =>
        ctx.setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    // TODO: We'll need to allow renaming notes in any view (except trash)
    ctx.setUI({
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          input,
          view: "all",
        },
      },
    });

    const [value, action] = await completed;
    if (action === "confirm") {
      try {
        const newNote = await window.rpc("notes.update", {
          id: note.id,
          name: value,
        });
        ctx.setNotes((notes) => {
          const index = notes.findIndex((n) => n.id === note.id);
          notes.splice(index, 1, newNote);

          return notes;
        });
      } catch (e) {
        promptError(e.message);
      }
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.deleteNote": async (ctx, id) => {
    throw new NotImplementedError();
  },
  "sidebar.setSelection": async (ctx, selected) => {
    ctx.setUI({
      sidebar: {
        explorer: {
          selected,
        },
      },
    });
  },
  "sidebar.clearSelection": async (ctx) => {
    console.log("clear!");
    ctx.setUI({
      sidebar: {
        explorer: {
          selected: [],
        },
      },
    });
  },
  "sidebar.moveSelectionUp": async ({ getState, setUI }) => {
    const { ui, notes, notebooks, tags } = getState();
    const [, selectables] = getExplorerItems(
      ui.sidebar.explorer.view,
      notes,
      notebooks,
      tags
    );

    const { selected } = ui.sidebar.explorer;
    if ((selected?.length ?? 0) === 0) {
      setUI({
        sidebar: {
          explorer: {
            selected: selectables.slice(-1),
          },
        },
      });
    } else {
      const curr = selectables.findIndex((s) => s === selected![0]);
      if (curr == -1) {
        throw Error(`Current selectable not found`);
      }

      const next = clamp(curr - 1, 0, selectables.length - 1);
      if (curr !== next) {
        setUI({
          sidebar: {
            explorer: {
              selected: selectables.slice(next, next + 1),
            },
          },
        });
      }
    }
  },
  "sidebar.moveSelectionDown": async ({ getState, setUI }) => {
    const { ui, notes, notebooks, tags } = getState();
    const [, selectables] = getExplorerItems(
      ui.sidebar.explorer.view,
      notes,
      notebooks,
      tags
    );

    const { selected } = ui.sidebar.explorer;
    let nextIndex = 0;
    let currIndex;
    if (selected != null && selected.length > 0) {
      currIndex = selectables.findIndex((s) => s === head(selected));
      if (currIndex == -1) {
        throw Error(`Current selectable not found`);
      }

      nextIndex = clamp(currIndex + 1, 0, selectables.length - 1);
      if (nextIndex == currIndex) {
        return;
      }
    }

    setUI({
      sidebar: {
        explorer: {
          selected: selectables.slice(nextIndex, nextIndex + 1),
        },
      },
    });
  },
  "sidebar.setExplorerView": async (ctx, view) => {
    if (view == null) {
      return;
    }

    ctx.setUI({
      sidebar: {
        explorer: {
          view,
          input: undefined,
          selected: undefined,
        },
      },
    });
  },
};
