import {
  AwaitableInput,
  createAwaitableInput,
} from "../../../shared/awaitableInput";
import { ExplorerView } from "../../../shared/domain/state";
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

    setExplorerInput(ctx, input, "tags");
    const [value, action] = await completed;

    if (action === "confirm") {
      try {
        const tag = await window.rpc("tags.create", {
          name: value,
        });
        ctx.setTags((tags) => [...tags, tag]);
      } catch (e) {
        promptError(e.message);
      }
    }

    clearExplorerInput(ctx);
  },
  "sidebar.renameTag": async (ctx, id) => {
    const tag = getTag(ctx, id);
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

    setExplorerInput(ctx, input, "tags");
    const [name, action] = await completed;

    if (action === "confirm") {
      try {
        const updatedTag = await window.rpc("tags.update", {
          id: tag.id,
          name,
        });

        ctx.setTags((tags) => {
          const index = tags.findIndex((t) => t.id === updatedTag.id);
          tags[index] = updatedTag;
          return tags;
        });
      } catch (e) {
        promptError(e.message);
      }
    }

    clearExplorerInput(ctx);
  },
  "sidebar.deleteTag": async (ctx, id) => {
    const tag = getTag(ctx, id);
    const res = await promptConfirmAction("delete", `tag ${tag.name}`);

    if (res.text === "Yes") {
      await window.rpc("tags.delete", { id: tag.id });
      ctx.setTags((tags) => [...tags.filter((t) => t.id !== tag.id)]);
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
  "sidebar.moveSelectionUp": async (ctx) => {
    // TODO: Support nested logic later on
    console.log("IMPLEMENT THIS!");
  },
  "sidebar.moveSelectionDown": async (ctx) => {
    console.log("IMPLEMENT THIS!");
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

// Helpers should only be created if they are used in 2 or more places

export function getTag(ctx: ExecutionContext, id?: string) {
  if (id == null) {
    throw Error(`No tag id passed.`);
  }

  const { tags } = ctx.getState();
  const tag = tags.find((t) => t.id === id);

  if (tag == null) {
    throw Error(`No tag with id ${id} found.`);
  }

  return tag;
}

export function setExplorerInput(
  ctx: ExecutionContext,
  input: AwaitableInput,
  view?: ExplorerView
) {
  ctx.setUI({
    sidebar: {
      explorer: {
        input,
        view,
      },
    },
  });
}

export function clearExplorerInput(ctx: ExecutionContext) {
  ctx.setUI({
    sidebar: {
      explorer: {
        input: undefined,
      },
    },
  });
}
