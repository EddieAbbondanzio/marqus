import { createAwaitableInput } from "../../../shared/awaitableInput";
import { Entity, EntityType, Note, Tag } from "../../../shared/domain/entities";
import { getNoteSchema, getTagSchema } from "../../../shared/domain/schemas";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace, ExecutionContext } from "./types";
import * as yup from "yup";
import { NotFoundError } from "../../../shared/errors";
import { parseFullyQualifiedId } from "../../../shared/utils";
import { ExplorerView } from "../../../shared/domain/state";
import { head } from "lodash";

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

    const tag = getTag(ctx, id!);
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
    const tag = getTag(ctx, id!);
    const res = await promptConfirmAction("delete", `tag ${tag.name}`);

    if (res.text === "Yes") {
      await window.rpc("tags.delete", { id: tag.id });
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
      const [type, id] = parseFullyQualifiedId(firstSelected);
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
            parentId,
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
    let note = getNote(ctx, id!);
    let { notes } = ctx.getState();
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
    console.log("delete tag.");
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
    ctx.setUI({
      sidebar: {
        explorer: {
          selected: [],
        },
      },
    });
  },
  "sidebar.moveSelectionUp": async (ctx) => {
    console.log("UP");
    ctx.publish("sidebar.moveSelectionUp");
  },
  "sidebar.moveSelectionDown": async (ctx) => {
    ctx.publish("sidebar.moveSelectionDown");
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

function getTag(ctx: ExecutionContext, id: string): Tag {
  const tag = ctx.getState().tags.find((t) => t.id === id);
  if (tag == null) {
    throw new NotFoundError(`No tag with id ${id} found.`);
  }

  return tag;
}

function getNote(ctx: ExecutionContext, id: string): Note {
  const note = ctx.getState().notes.find((n) => n.id === id);
  if (note == null) {
    throw new NotFoundError(`No note with id ${id} found.`);
  }
  return note;
}
