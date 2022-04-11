import React, { useEffect, useMemo } from "react";
import { px } from "../../shared/dom";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuItems,
} from "./shared/ContextMenu";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import { isResourceId } from "../../shared/domain";
import { Store, StoreControls, StoreListener } from "../store";
import styled from "styled-components";
import { h100, THEME, w100 } from "../css";
import { clamp, Dictionary, head, isEmpty, keyBy, orderBy, take } from "lodash";
import { Note, getNoteById, getNoteSchema } from "../../shared/domain/note";
import { createPromisedInput, PromisedInput } from "../../shared/promisedInput";
import { NotFoundError } from "../../shared/errors";
import { promptError, promptConfirmAction } from "../utils/prompt";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";
import {
  SIDEBAR_MENU_HEIGHT,
  SidebarMenu,
  SidebarInput,
  getSidebarMenuAttribute,
} from "./SidebarMenu";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const EXPANDED_ICON = faChevronDown;
const COLLAPSED_ICON = faChevronRight;
const MIN_WIDTH = px(300);
export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps): JSX.Element {
  const { notes } = store.state;
  const { sidebar } = store.state.ui;
  const { input } = sidebar;
  const expandedLookup = keyBy(sidebar.expanded, (e) => e);
  const selectedLookup = keyBy(sidebar.selected, (s) => s);

  const [menus, itemIds] = useMemo(
    () => renderMenus(notes, store, input, expandedLookup, selectedLookup),
    [notes, store, input, expandedLookup, selectedLookup]
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
    store.on("sidebar.dragNote", dragNote);

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
      store.off("sidebar.dragNote", dragNote);
    };
  }, [itemIds, sidebar, store]);

  return (
    <StyledResizable
      minWidth={MIN_WIDTH}
      width={store.state.ui.sidebar.width}
      onResize={(w) => store.dispatch("sidebar.resizeWidth", w)}
    >
      <StyledFocusable store={store} name="sidebar">
        <ContextMenu store={store} items={getContextMenuItems}>
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

const getContextMenuItems: ContextMenuItems = (ev: MouseEvent) => {
  const target = getSidebarMenuAttribute(ev.target as HTMLElement);
  const items: ContextMenuItem[] = [
    {
      role: "entry",
      text: "New Note",
      event: "sidebar.createNote",
      eventInput: target,
    },
  ];

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
  expandedLookup: Dictionary<string>,
  selectedLookup: Dictionary<string>
): [JSX.Element[], string[]] {
  const menus: JSX.Element[] = [];
  const flatIds: string[] = [];

  const recursive = (note: Note, parent?: Note, depth?: number) => {
    const isExpanded = expandedLookup[note.id];
    const isSelected = selectedLookup[note.id] != null;
    const currDepth = depth ?? 0;
    const hasChildren = !isEmpty(note.children);

    const onClick = () => {
      if (isSelected) {
        store.dispatch("sidebar.toggleItemExpanded", note.id);
      }
      store.dispatch("sidebar.setSelection", [note.id]);
    };

    let icon;
    if (hasChildren) {
      icon = isExpanded ? EXPANDED_ICON : COLLAPSED_ICON;
    }

    if (input?.id != null && input.id === note.id) {
      menus.push(
        <SidebarInput
          store={store}
          key="sidebarInput"
          value={input}
          depth={currDepth}
        />
      );
    } else {
      menus.push(
        <SidebarMenu
          icon={icon}
          key={note.id}
          id={note.id}
          value={note.name}
          onClick={onClick}
          onIconClick={(ev: React.MouseEvent) => {
            ev.stopPropagation();
            store.dispatch("sidebar.toggleItemExpanded", note.id);
          }}
          onDrag={(newParent) =>
            store.dispatch("sidebar.dragNote", { note: note.id, newParent })
          }
          isSelected={isSelected}
          depth={currDepth}
        />
      );
    }

    flatIds.push(note.id);

    if (hasChildren && isExpanded) {
      orderBy(note.children!, ["name"]).forEach((n) =>
        recursive(n, note, currDepth + 1)
      );
    }

    // When creating a new value input is always added to end of list
    if (input != null && input.parentId != null && input.parentId === note.id) {
      menus.push(
        <SidebarInput
          store={store}
          key="sidebarInput"
          value={input}
          depth={currDepth + 1}
        />
      );
    }
  };
  orderBy(notes, ["name"]).forEach((n) => recursive(n));
  if (input != null && input.parentId == null && input.id == null) {
    menus.push(
      <SidebarInput store={store} key="sidebarInput" value={input} depth={0} />
    );
  }

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
    const toggleId = id ?? head(prev.sidebar.selected);
    if (toggleId == null) {
      throw new Error("No item to toggle");
    }

    // Don't expand notes with no children
    const { notes } = ctx.getState();
    const note = getNoteById(notes, toggleId);
    if (isEmpty(note.children)) {
      return prev;
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
  { value: parentId },
  ctx
) => {
  const {
    ui: {
      sidebar: { expanded },
    },
  } = ctx.getState();

  const schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  const input = createPromisedInput(
    {
      schema,
      parentId: parentId ?? undefined,
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
        parent: parentId ?? undefined,
      });

      ctx.setNotes((notes) => {
        if (parentId == null) {
          return [...notes, note];
        } else {
          const parent = getNoteById(notes, parentId);
          parent.children ??= [];
          parent.children.push(note);
          note.parent = parent.id;
          return notes;
        }
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

export const renameNote: StoreListener<"sidebar.renameNote"> = async (
  { value: id },
  ctx
) => {
  const { notes } = ctx.getState();
  const schema: yup.StringSchema = yup.reach(getNoteSchema(), "name");
  const { name: value } = getNoteById(notes, id!);

  const input = createPromisedInput(
    {
      id,
      value,
      schema,
      resourceType: "note",
    },
    setExplorerInput(ctx)
  );
  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      input,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    try {
      const note = getNoteById(notes, id!);
      const updatedNote = await window.ipc("notes.updateMetadata", {
        id,
        name,
      });

      ctx.setNotes((notes) => {
        if (updatedNote.parent == null) {
          const index = notes.findIndex((n) => n.id === note.id);
          notes.splice(index, 1, updatedNote);
          return notes;
        } else {
          const parent = getNoteById(notes, updatedNote.parent);
          const index = notes.findIndex((n) => n.id === note.id);
          parent.children!.splice(index, 1, updatedNote);
          return notes;
        }
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
    ctx.setNotes((notes) => {
      if (note.parent == null) {
        return notes.filter((t) => t.id !== note.id);
      }

      const parent = getNoteById(notes, note.parent);
      parent.children = parent.children!.filter((t) => t.id !== note.id);
      return notes;
    });
  }
};

export const dragNote: StoreListener<"sidebar.dragNote"> = async (
  { value },
  ctx
) => {
  const { notes } = ctx.getState();
  const note = getNoteById(notes, value.note);
  let newParent;
  if (value.newParent != null) {
    newParent = getNoteById(notes, value.newParent);
  }

  // Don't allow if parent is itself
  if (note.id === value.newParent) {
    return;
  }

  // Don't bother if parent is the same.
  if (
    note.parent != null &&
    newParent != null &&
    note.parent === newParent.id
  ) {
    return;
  }

  // Prevent infinite loop by ensuring we can't reach the child from the parent.
  if (!isEmpty(note.children) && newParent != null) {
    const isNewParentChildOfNote =
      getNoteById(note.children!, newParent.id, false) != null;
    if (isNewParentChildOfNote) {
      return;
    }
  }

  const updatedNote = await window.ipc("notes.updateMetadata", {
    id: note.id,
    parent: newParent?.id,
  });

  ctx.setNotes((notes) => {
    // Remove child from original parent. (If applicable)
    if (note.parent != null) {
      const ogParent = getNoteById(notes, note.parent);
      ogParent.children = (ogParent.children ?? []).filter(
        (c) => c.id !== note.id
      );
    } else {
      notes = notes.filter((n) => n.id !== note.id);
    }

    // Add to new parent (if applicable)
    if (updatedNote.parent != null) {
      const newParent = getNoteById(notes, updatedNote.parent);
      newParent.children ??= [];
      newParent.children.push(updatedNote);
      updatedNote.parent = newParent.id;
    } else {
      notes.push(updatedNote);
    }

    return notes;
  });
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
