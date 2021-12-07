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
        console.log("confirm tag: ", tagInput.value);
        const tag = await window.rpc("tags.create", {
          name: tagInput.value,
        });
        ctx.setTags((tags) => [...tags, tag]);
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
