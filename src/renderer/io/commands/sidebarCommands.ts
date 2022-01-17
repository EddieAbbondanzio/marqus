import {
  AwaitableInput,
  createAwaitableInput,
} from "../../../shared/awaitableInput";
import { ExplorerView } from "../../../shared/domain/app";
import { tags } from "../../services/tags";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace, ExecutionContext } from "./types";

export const sidebarCommands: CommandsForNamespace<"sidebar"> = {
  "sidebar.focus": async (setUI) => {
    setUI({
      focused: ["sidebar"],
    });
    console.log("set focus to sidebar");
  },
  "sidebar.toggle": async (setUI) => {
    setUI((prev) => ({
      sidebar: {
        hidden: !(prev.sidebar.hidden ?? false),
      },
    }));
  },
  "sidebar.resizeWidth": async (setUI, width) => {
    if (width == null) {
      return;
    }

    setUI({
      sidebar: {
        width,
      },
    });
  },
  "sidebar.updateScroll": async (setUI, scroll) => {
    if (scroll == null) {
      return;
    }

    setUI({
      sidebar: {
        scroll,
      },
    });
  },
  "sidebar.scrollDown": async (setUI) => {
    setUI((prev) => {
      // Max scroll clamp is performed in scrollable.
      const scroll = prev.sidebar.scroll + 30;
      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.scrollUp": async (setUI) => {
    setUI((prev) => {
      const scroll = Math.max(prev.sidebar.scroll - 30, 0);
      return {
        sidebar: {
          scroll,
        },
      };
    });
  },
  "sidebar.toggleFilter": async (setUI) => {
    setUI((prev) => {
      return {
        sidebar: {
          filter: {
            expanded: !prev.sidebar.filter.expanded,
          },
        },
      };
    });
  },
  "sidebar.createTag": async (setUI) => {
    let [input, completed] = createAwaitableInput({ value: "" }, (value) =>
      setUI({
        sidebar: {
          explorer: {
            input: {
              value,
            },
          },
        },
      })
    );

    setUI({
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
        const tag = await tags.create(value);
      } catch (e) {
        promptError(e.message);
      }
    }

    setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.renameTag": async (setUI, id) => {
    const tag = await tags.getById(id!);
    let [input, completed] = createAwaitableInput(
      { value: tag.name, id: tag.id },
      (value) =>
        setUI({
          sidebar: {
            explorer: {
              input: {
                value,
              },
            },
          },
        })
    );

    setUI({
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
        await tags.rename(tag, name);
      } catch (e) {
        promptError(e.message);
      }
    }

    setUI({
      sidebar: {
        explorer: {
          input: undefined,
        },
      },
    });
  },
  "sidebar.deleteTag": async (setUI, id) => {
    const tag = await tags.getById(id!);
    const res = await promptConfirmAction("delete", `tag ${tag.name}`);

    if (res.text === "Yes") {
      await tags.delete(tag);
    }
  },
  "sidebar.setSelection": async (setUI, selected) => {
    setUI({
      sidebar: {
        explorer: {
          selected,
        },
      },
    });
  },
  "sidebar.moveSelectionUp": async () => {
    // TODO: Support nested logic later on
    console.log("IMPLEMENT THIS!");
  },
  "sidebar.moveSelectionDown": async () => {
    console.log("IMPLEMENT THIS!");
  },
  "sidebar.setExplorerView": async (setUI, view) => {
    if (view == null) {
      return;
    }

    setUI({
      sidebar: {
        explorer: {
          view,
          input: undefined,
        },
      },
    });
  },
};
