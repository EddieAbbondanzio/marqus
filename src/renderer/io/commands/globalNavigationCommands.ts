import { promptError } from "../../utils/prompt";
import {
  CommandsForNamespace,
  createAwaitForInput as createAwaitableInput,
} from "./types";

export const globalNavigationCommands: CommandsForNamespace<"globalNavigation"> =
  {
    "globalNavigation.resizeWidth": async (ctx, width) => {
      if (width == null) {
        return;
      }

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          width,
        },
      }));
    },
    "globalNavigation.updateScroll": async (ctx, scroll) => {
      if (scroll == null) {
        return;
      }

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          scroll,
        },
      }));
    },
    "globalNavigation.createTag": async (ctx) => {
      let [tagInput, completed] = createAwaitableInput();

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          tagInput,
        },
      }));

      if ((await completed) === "confirm") {
        try {
          const tag = await window.rpc("tags.create", {
            name: tagInput.value,
          });
          ctx.setTags((tags) => [...tags, tag]);
        } catch (e) {
          promptError(e.message);
        }
      }

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          tagInput: undefined,
        },
      }));
    },
  };
