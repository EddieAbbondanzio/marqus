import { generateId, Tag } from "../../shared/state";
import { UnsupportedError } from "../../shared/errors";
import { Command } from "./types";

const focus: Command = async ({ commit, state }) => {
  state.ui.focused = "globalNavigation";
  await commit(state);
};

/**
 * Resize global navigation width.
 * @param newWidth New width string ex: '120px'
 */
const resizeWidth: Command<string> = async ({ commit, state }, newWidth) => {
  if (newWidth == null) {
    throw Error();
  }

  state.ui.globalNavigation.width = newWidth;
  await commit(state);
};

/**
 * Update the current scroll position.
 * @param newScroll The new scroll position.
 */
const updateScroll: Command<number> = async ({ commit, state }, newScroll) => {
  if (newScroll == null) {
    throw Error();
  }

  state.ui.globalNavigation.scroll = Math.max(newScroll, 0);
  await commit(state);
};

const scrollDown: Command<number> = async (
  { commit, state },
  increment = 30
) => {
  const newScroll = Math.max(state.ui.globalNavigation.scroll + increment, 0);
  state.ui.globalNavigation.scroll = newScroll;

  await commit(state);
};

const scrollUp: Command<number> = async ({ commit, state }, increment = 30) => {
  const newScroll = Math.max(state.ui.globalNavigation.scroll - increment, 0);
  state.ui.globalNavigation.scroll = newScroll;

  await commit(state);
};

const createTag: Command = async ({ commit, rollback, state }) => {
  if (state.tags.input != null) {
    throw Error(`Tag input already started`);
  }

  let confirm: () => void;
  let cancel: () => void;

  let confirmPromise: Promise<string> = new Promise(
    (res) => (confirm = () => res("confirm"))
  );
  let cancelPromise: Promise<string> = new Promise(
    (res) => (cancel = () => res("cancel"))
  );

  state.tags.input = {
    mode: "create",
    value: "",
    confirm: confirm!,
    cancel: cancel!,
  };
  await commit(state);

  const result = await Promise.race([confirmPromise, cancelPromise]);
  switch (result) {
    case "confirm":
      const tag: Tag = {
        id: generateId(),
        name: state.tags.input.value,
        dateCreated: new Date(),
      };

      state.tags.input = undefined;
      state.tags.values = [...state.tags.values, tag];
      await commit(state);
      break;

    case "cancel":
      await rollback();
      break;

    default:
      throw new UnsupportedError(`Invalid input response ${result}`);
  }
};

export const GLOBAL_NAVIGATION_REGISTRY = {
  focus,
  resizeWidth,
  updateScroll,
  scrollDown,
  scrollUp,
  createTag,
};
