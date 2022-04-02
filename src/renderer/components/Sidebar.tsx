import React, { useEffect, useMemo } from "react";
import { px } from "../utils/dom";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuItems,
} from "./shared/ContextMenu";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { findParent } from "../utils/findParent";
import { isResourceId, parseResourceId } from "../../shared/domain/id";
import { Store, StoreControls, StoreListener } from "../store";
import styled from "styled-components";
import { h100, THEME, w100 } from "../css";
import {
  clamp,
  flatMapDeep,
  head,
  isEmpty,
  keyBy,
  orderBy,
  take,
} from "lodash";
import { Note, getNoteById, getNoteSchema } from "../../shared/domain/note";
import { NOTE_ICON, TAG_ICON } from "../libs/fontAwesome";
import {
  PromisedInputParams,
  createPromisedInput,
  PromisedInput,
} from "../../shared/awaitableInput";
import { InvalidOpError, NotFoundError } from "../../shared/errors";
import { promptError, promptConfirmAction } from "../utils/prompt";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";
import {
  SIDEBAR_MENU_ATTRIBUTE,
  SIDEBAR_MENU_HEIGHT,
  SidebarMenu,
} from "./SidebarMenu";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const EXPANDED_ICON = faChevronDown;
const COLLAPSED_ICON = faChevronRight;
export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps) {
  const { notes } = store.state;
  const { sidebar } = store.state.ui;
  const { input } = sidebar;
  const expandedLookup = keyBy(sidebar.expanded, (e) => e);
  const selectedLookup = keyBy(sidebar.selected, (s) => s);

  const [menus, itemIds] = useMemo(
    () => renderMenus(notes, store, input, expandedLookup, selectedLookup),
    [notes, store.state]
  );

  // Sanity check
  if (input != null && input.parentId != null) {
    if (!isResourceId(input.parentId)) {
      throw new Error(
        `Explorer input parent id must be a global id. Instead '${input.parentId}' was passed.`
      );
    }
  }

  useEffect(() => {
    const getNext = (increment: number) => {
      if (isEmpty(sidebar.selected)) {
        return take(itemIds, 1);
      }
      let next = 0;
      let curr = 0;
      const firstSelected = head(sidebar.selected)!;
      curr = itemIds.findIndex((s) => s === firstSelected);
      if (curr === -1) {
        throw new NotFoundError(`No selectable ${firstSelected} found`);
      }

      next = clamp(curr + increment, 0, itemIds.length - 1);
      return itemIds.slice(next, next + 1);
    };

    const updateSelected: StoreListener<
      | "sidebar.clearSelection"
      | "sidebar.moveSelectionDown"
      | "sidebar.moveSelectionUp"
      | "sidebar.setSelection"
    > = async ({ type, value }, { setUI }) => {
      let selected: string[] | undefined;

      switch (type) {
        case "sidebar.moveSelectionDown":
          selected = getNext(1);
          break;
        case "sidebar.moveSelectionUp":
          selected = getNext(-1);
          break;
        case "sidebar.setSelection":
          if (value == null) {
            selected = undefined;
          } else {
            // HACK
            selected = [itemIds.find((i) => i === value[0])!];
          }
          break;
      }

      setUI({
        sidebar: {
          selected: selected == null ? undefined : [selected[0]],
        },
      });
    };

    store.on("sidebar.resizeWidth", resizeWidth);
    store.on("sidebar.scrollUp", scrollUp);
    store.on("sidebar.scrollDown", scrollDown);
    store.on("sidebar.updateScroll", updateScroll);
    store.on("sidebar.toggleItemExpanded", toggleItemExpanded);
    store.on(
      [
        "sidebar.moveSelectionUp",
        "sidebar.moveSelectionDown",
        "sidebar.clearSelection",
        "sidebar.setSelection",
      ],
      updateSelected
    );
    store.on("sidebar.createNote", createNote);
    store.on("sidebar.renameNote", renameNote);
    store.on("sidebar.deleteNote", deleteNote);

    return () => {
      store.off("sidebar.resizeWidth", resizeWidth);
      store.off("sidebar.scrollUp", scrollUp);
      store.off("sidebar.scrollDown", scrollDown);
      store.off("sidebar.updateScroll", updateScroll);
      store.off("sidebar.toggleItemExpanded", toggleItemExpanded);
      store.off(
        [
          "sidebar.moveSelectionUp",
          "sidebar.moveSelectionDown",
          "sidebar.clearSelection",
          "sidebar.setSelection",
        ],
        updateSelected
      );
      store.off("sidebar.createNote", createNote);
      store.off("sidebar.renameNote", renameNote);
      store.off("sidebar.deleteNote", deleteNote);
    };
  }, [store.state]);

  return (
    <StyledResizable
      minWidth={px(300)}
      width={store.state.ui.sidebar.width}
      onResize={(w) => store.dispatch("sidebar.resizeWidth", w)}
    >
      <StyledFocusable store={store} name="sidebar">
        <ContextMenu
          name="contextMenu"
          items={getContextMenuItems}
          store={store}
        >
          <StyledScrollable
            scroll={store.state.ui.sidebar.scroll}
            onScroll={(s) => store.dispatch("sidebar.updateScroll", s)}
          >
            {menus}
          </StyledScrollable>
        </ContextMenu>
      </StyledFocusable>
    </StyledResizable>
  );
}

const StyledResizable = styled(Resizable)`
  user-select: none;
  background-color: ${THEME.sidebar.background};
`;

const StyledFocusable = styled(Focusable)`
  ${w100}
  ${h100}
`;

const StyledScrollable = styled(Scrollable)`
  display: flex;
  flex-direction: column;
`;

const getContextMenuItems: ContextMenuItems = (a: MouseEvent) => {
  const items: ContextMenuItem[] = [
    {
      role: "entry",
      text: "New Note",
      event: "sidebar.createNote",
    },
  ];

  const target = findParent(
    a.target as HTMLElement,
    (el) => el.hasAttribute(SIDEBAR_MENU_ATTRIBUTE),
    {
      matchValue: (el) => el.getAttribute(SIDEBAR_MENU_ATTRIBUTE),
    }
  );

  if (target != null) {
    items.push(
      {
        role: "entry",
        text: "Rename",
        event: "sidebar.renameNote",
        eventInput: target,
      },
      {
        role: "entry",
        text: "Delete",
        event: "sidebar.deleteNote",
        eventInput: target,
      }
    );
  }

  return items;
};

export function renderMenus(
  notes: Note[],
  store: Store,
  input: PromisedInput | undefined,
  expandedLookup: Record<string, any>,
  selectedLookup: Record<string, any>
): [JSX.Element[], string[]] {
  const menus: JSX.Element[] = [];
  const flatIds: string[] = [];

  const recursive = (note: Note, parent?: Note, depth?: number) => {
    const isExpanded = expandedLookup[note.id];
    const isSelected = selectedLookup[note.id];
    const currDepth = depth ?? 0;

    const onClick = () => {
      store.dispatch("sidebar.toggleItemExpanded", note.id);
      store.dispatch("sidebar.setSelection", [note.id]);
    };

    menus.push(
      <SidebarMenu
        icon={isExpanded ? EXPANDED_ICON : COLLAPSED_ICON}
        key={note.id}
        id={note.id}
        value={note.name}
        onClick={onClick}
        isSelected={isSelected}
        depth={currDepth}
      />
    );
    flatIds.push(note.id);

    if (note.children != null && note.children.length > 0) {
      note.children.forEach((n) => recursive(n, note, currDepth + 1));
    }

    // Input is always added to end of list
    if (input != null) {
      if (
        (input.parentId == null && currDepth === 0) ||
        (input.parentId != null &&
          parent != null &&
          input.parentId === parent?.id)
      ) {
        let inputIcon;
        switch (input.resourceType) {
          case "note":
            inputIcon = NOTE_ICON;
            break;
          case "tag":
            inputIcon = TAG_ICON;
            break;
          default:
            throw new InvalidOpError();
        }

        menus.push(
          <SidebarMenu
            store={store}
            key="sidebarInput"
            value={input}
            icon={inputIcon}
            depth={0}
          />
        );
      }
    }
  };
  orderBy(notes, ["name"]).forEach((n) => recursive(n));

  return [menus, flatIds];
}

export const resizeWidth: StoreListener<"sidebar.resizeWidth"> = (
  { value: width },
  ctx
) => {
  if (width == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      width,
    },
  });
};

export const updateScroll: StoreListener<"sidebar.updateScroll"> = (
  { value: scroll },
  ctx
) => {
  if (scroll == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      scroll,
    },
  });
};

export const scrollUp: StoreListener<"sidebar.scrollUp"> = (_, { setUI }) => {
  setUI((prev) => {
    const scroll = Math.max(prev.sidebar.scroll - SIDEBAR_MENU_HEIGHT, 0);
    return {
      sidebar: {
        scroll,
      },
    };
  });
};

export const scrollDown: StoreListener<"sidebar.scrollDown"> = (
  _,
  { setUI }
) => {
  setUI((prev) => {
    // Max scroll clamp is performed in scrollable.
    const scroll = prev.sidebar.scroll + SIDEBAR_MENU_HEIGHT;
    return {
      sidebar: {
        scroll,
      },
    };
  });
};

export const toggleItemExpanded: StoreListener<"sidebar.toggleItemExpanded"> = (
  { value: id },
  ctx
) => {
  ctx.setUI((prev) => {
    let toggleId = id ?? head(prev.sidebar.selected);
    if (toggleId == null) {
      throw new Error("No item to toggle");
    }

    const { sidebar } = prev;
    if (isEmpty(sidebar.expanded)) {
      sidebar.expanded = [toggleId];
      return prev;
    }

    const exists = sidebar.expanded!.some(
      (expandedId) => expandedId === toggleId
    );
    if (exists) {
      sidebar.expanded = sidebar.expanded!.filter(
        (expandedId) => expandedId !== toggleId
      );
    } else {
      sidebar.expanded!.push(toggleId);
    }

    return prev;
  });
};

export const createNote: StoreListener<"sidebar.createNote"> = async (
  _,
  ctx
) => {
  const {
    notes,
    ui: {
      sidebar: { selected, expanded },
    },
  } = ctx.getState();

  let schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  let parentId: string | undefined;

  const firstSelected = head(selected);
  if (firstSelected != null) {
    const [type] = parseResourceId(firstSelected);

    if (type === "note") {
      parentId = firstSelected;
    }
  }

  let input = createPromisedInput(
    {
      schema,
      parentId,
      resourceType: "note",
    },
    setExplorerInput(ctx)
  );

  // Expand parent if it isn't already.
  if (parentId != null && expanded?.every((id) => id !== parentId)) {
    expanded.push(parentId);
  }

  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      input,
      expanded,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    try {
      const note = await window.ipc("notes.create", {
        name,
        parent: parentId,
      });
      ctx.setNotes((notes) => [...notes, note]);
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      input: undefined,
    },
  });
};

export const renameNote: StoreListener<"sidebar.renameNote"> = async (
  { value: id },
  ctx
) => {
  const { notes } = ctx.getState();
  let schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  const { name: value } = getNoteById(notes, id!);
  let inputParams: PromisedInputParams = {
    id,
    value,
    schema,
    resourceType: "note",
  };

  let input = createPromisedInput(inputParams, setExplorerInput(ctx));

  // TODO: We'll need to allow renaming notes in any view (except trash)
  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      input,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    try {
      let note = getNoteById(notes, id!);
      const newNote = await window.ipc("notes.rename", {
        id,
        name,
      });
      ctx.setNotes((notes) => {
        const index = notes.findIndex((n) => n.id === note.id);
        notes.splice(index, 1, newNote);
        return [...notes];
      });
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      input: undefined,
    },
  });
};

export const deleteNote: StoreListener<"sidebar.deleteNote"> = async (
  { value: id },
  ctx
) => {
  const { notes } = ctx.getState();
  const note = getNoteById(notes, id!);
  const res = await promptConfirmAction("delete", `note ${note.name}`);
  if (res.text === "Yes") {
    await window.ipc("notes.delete", { id: note.id });
    ctx.setNotes((notes) => notes.filter((t) => t.id !== note.id));
  }
};

function setExplorerInput(ctx: StoreControls) {
  return (value: string) =>
    ctx.setUI({
      sidebar: {
        input: {
          value,
        },
      },
    });
}
