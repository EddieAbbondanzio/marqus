import { over, overEvery } from "lodash";
import { createAwaitableInput } from "../../../shared/awaitableInput";
import { promptConfirmAction, promptError } from "../../utils/prompt";
import { CommandsForNamespace } from "./types";

export const globalNavigationCommands: CommandsForNamespace<"globalNavigation"> =
  {
    "globalNavigation.focus": async (ctx) => {
      ctx.setUI((ui) => ({
        ...ui,
        focused: ["globalNavigation"],
      }));
    },
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
      let [tagInput, completed] = createAwaitableInput(
        { value: "" },
        (value) => {
          ctx.setUI((prev) => ({
            ...prev,
            globalNavigation: {
              ...prev.globalNavigation,
              tagInput: {
                ...prev.globalNavigation.tagInput!,
                value,
              },
            },
          }));
        }
      );

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          tagInput,
        },
      }));

      if ((await completed) === "confirm") {
        try {
          const { value: name } = ctx.getState().ui.globalNavigation.tagInput!;
          const tag = await window.rpc("tags.create", {
            name,
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
    "globalNavigation.updateTag": async (ctx, id) => {
      if (id == null) {
        throw Error(`No id passed.`);
      }

      const tag = ctx.getState().tags.find((t) => t.id === id)!;

      let [tagInput, completed] = createAwaitableInput(
        { value: tag.name, id },
        (value) => {
          ctx.setUI((prev) => ({
            ...prev,
            globalNavigation: {
              ...prev.globalNavigation,
              tagInput: {
                ...prev.globalNavigation.tagInput!,
                value,
              },
            },
          }));
        }
      );

      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          tagInput,
        },
      }));

      if ((await completed) === "confirm") {
        try {
          const { value: name } = ctx.getState().ui.globalNavigation.tagInput!;
          const tag = await window.rpc("tags.update", {
            id,
            newName: name,
          });

          ctx.setTags((tags) => [...tags.filter((t) => t.id !== tag.id), tag]);
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
    "globalNavigation.deleteTag": async (ctx, id) => {
      const tag = ctx.getState().tags.find((t) => t.id === id);

      if (tag == null) {
        throw Error(`No tag found with id ${id}`);
      }

      const res = await promptConfirmAction("delete", `tag ${tag.name}`);
      if (res.text === "Yes") {
        await window.rpc("tags.delete", { id: tag.id });
        ctx.setTags((tags) => [...tags.filter((t) => t.id !== tag.id)]);
      }
    },
    "globalNavigation.setSelection": async (ctx, selected) => {
      ctx.setUI((prev) => ({
        ...prev,
        globalNavigation: {
          ...prev.globalNavigation,
          selected,
        },
      }));
    },
    "globalNavigation.moveSelectionUp": async (ctx) => {
      // TODO: Support nested logic later on
      ctx.setUI((s) => {
        console.log("IMPLEMENT THIS!");

        return {
          ...s,
        };
      });
    },
    "globalNavigation.moveSelectionDown": async (ctx) => {
      console.log("move selection down");
    },
  };
