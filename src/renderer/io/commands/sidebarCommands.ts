import { createAwaitableInput } from "../../../shared/awaitableInput";
import { Tag } from "../../../shared/domain/entities";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace, ExecutionContext } from "./types";

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
      console.log("toggle filter: ", !prev.sidebar.filter.expanded);
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
    let [input, completed] = createAwaitableInput({ value: "" }, (value) =>
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
    const tag = getTag(ctx, id!);
    let [input, completed] = createAwaitableInput(
      { value: tag.name, id: tag.id },
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
        },
      },
    });
  },
};

function getTag(ctx: ExecutionContext, id: string): Tag {
  const tag = ctx.getState().tags.find((t) => t.id === id);
  if (tag == null) {
    throw new Error(`No tag with id ${id} found.`);
  }

  return tag;
}
