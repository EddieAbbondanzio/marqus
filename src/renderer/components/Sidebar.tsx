import React, { useEffect, useMemo } from "react";
import { px } from "../../shared/dom";
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
import { h100, THEME, w100 } from "../styling";
import {
  clamp,
  flatMapDeep,
  head,
  isEmpty,
  keyBy,
  orderBy,
  take,
} from "lodash";
import {
  Note,
  getNotesForNotebook,
  getNoteById,
  getNoteSchema,
} from "../../shared/domain/note";
import {
  addChild,
  getNotebookById,
  getNotebookSchema,
  Notebook,
  removeChild,
  replaceChild,
} from "../../shared/domain/notebook";
import { SidebarItem } from "../../shared/domain/state";
import { NOTEBOOK_ICON, NOTE_ICON, RESOURCE_ICONS } from "../libs/fontAwesome";
import {
  PromisedInputParams,
  createPromisedInput,
  PromisedInput,
} from "../../shared/awaitableInput";
import { NotFoundError } from "../../shared/errors";
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
  const { notes, notebooks } = store.state;
  const { sidebar } = store.state.ui;
  const { input } = sidebar;
  const expandedLookup = keyBy(sidebar.expanded, (e) => e);
  const selectedLookup = keyBy(sidebar.selected, (s) => s);

  const [items, itemsFlat] = useMemo(
    () => getItems(notes, notebooks, expandedLookup),
    [notes, notebooks, store.state]
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
        return take(items, 1);
      }
      let next = 0;
      let curr = 0;
      const firstSelected = head(sidebar.selected)!;
      curr = itemsFlat.findIndex((s) => s.id === firstSelected);
      if (curr === -1) {
        throw new NotFoundError(`No selectable ${firstSelected} found`);
      }

      next = clamp(curr + increment, 0, itemsFlat.length - 1);
      return itemsFlat.slice(next, next + 1);
    };

    const updateSelected: StoreListener<
      | "sidebar.clearSelection"
      | "sidebar.moveSelectionDown"
      | "sidebar.moveSelectionUp"
      | "sidebar.setSelection"
    > = async ({ type, value }, { setUI }) => {
      let selected: SidebarItem[] | undefined;

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
            selected = [itemsFlat.find((i) => i.id === value[0])!];
          }
          break;
      }

      setUI({
        sidebar: {
          selected: selected == null ? undefined : [selected[0].id],
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
    store.on("sidebar.createNotebook", createNotebook);
    store.on("sidebar.renameNotebook", renameNotebook);
    store.on("sidebar.deleteNotebook", deleteNotebook);
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
      store.off("sidebar.createNotebook", createNotebook);
      store.off("sidebar.renameNotebook", renameNotebook);
      store.off("sidebar.deleteNotebook", deleteNotebook);
      store.off("sidebar.createNote", createNote);
      store.off("sidebar.renameNote", renameNote);
      store.off("sidebar.deleteNote", deleteNote);
    };
  }, [store.state]);

  // Recursively renders
  const renderMenus = (
    items: SidebarItem[],
    parent?: SidebarItem
  ): JSX.Element[] => {
    const rendered: JSX.Element[] = [];

    for (const item of items) {
      const [type] = parseResourceId(item.id);
      let icon;
      if (type === "notebook") {
        icon = expandedLookup[item.id] != null ? EXPANDED_ICON : COLLAPSED_ICON;
      } else {
        icon = RESOURCE_ICONS[type];
      }

      if (input?.mode === "update" && input.id === item.id) {
        rendered.push(
          <SidebarMenu
            store={store}
            key="sidebarInput"
            value={input}
            icon={icon}
            isSelected={Boolean(selectedLookup[input.id])}
            depth={item.depth}
          />
        );
      } else {
        const onClick = () => {
          store.dispatch("sidebar.toggleItemExpanded", item.id);
          store.dispatch("sidebar.setSelection", [item.id]);
        };

        rendered.push(
          <SidebarMenu
            icon={icon}
            key={item.id}
            id={item.id}
            value={item.text}
            onClick={onClick}
            isSelected={Boolean(selectedLookup[item.id])}
            depth={item.depth}
          />
        );
      }
    }

    if (input?.mode === "create") {
      if (input?.parentId == parent?.id) {
        rendered.push(
          <SidebarMenu
            store={store}
            key="sidebarInput"
            value={input}
            icon={RESOURCE_ICONS[input.resourceType]}
            depth={0}
          />
        );
      }
    }

    return rendered;
  };

  const menus = renderMenus(itemsFlat);

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
    {
      role: "entry",
      text: "New Notebook",
      event: "sidebar.createNotebook",
    },
  ];

  const target = findParent(
    a.target as HTMLElement,
    (el) => el.hasAttribute(SIDEBAR_MENU_ATTRIBUTE),
    {
      matchValue: (el) => el.getAttribute(SIDEBAR_MENU_ATTRIBUTE),
    }
  );
  if (target == null) {
    return items;
  }

  const [targetType] = parseResourceId(target);
  switch (targetType) {
    case "notebook":
      items.push(
        {
          role: "entry",
          text: "Rename",
          event: "sidebar.renameNotebook",
          eventInput: target,
        },
        {
          role: "entry",
          text: "Delete",
          event: "sidebar.deleteNotebook",
          eventInput: target,
        }
      );
      break;

    case "note":
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
      break;
  }

  return items;
};

/**
 * Checks if the explorer item has children to render. This will also
 * include nested inputs.
 * @returns True if there are any children or an input
 */
export function hasChildren(item: SidebarItem, input?: PromisedInput): boolean {
  return Boolean(item.children?.length ?? 0 > 0) || item.id === input?.parentId;
}

export function getItems(
  notes: Note[],
  notebooks: Notebook[],
  expandedLookup: Record<string, any>
): [SidebarItem[], SidebarItem[]] {
  let items: SidebarItem[] = [];

  const recursive = (n: Notebook, parent?: SidebarItem, depth?: number) => {
    const currDepth = depth ?? 0;
    const item: SidebarItem = {
      id: n.id,
      text: n.name,
      icon: NOTEBOOK_ICON,
      depth: currDepth,
    };

    if (n.children != null && n.children.length > 0) {
      n.children.forEach((n) => recursive(n, item, currDepth + 1));
    }

    // Children are listed after nested notebooks
    if (expandedLookup[n.id] != null) {
      const notebookNotes = getNotesForNotebook(notes, n);
      item.children ??= [];
      item.children.push(
        ...notebookNotes.map((n) => ({
          id: n.id,
          text: n.name,
          icon: NOTE_ICON,
          depth: currDepth + 1,
        }))
      );
    }

    if (parent == null) {
      items.push(item);
    } else {
      parent.children ??= [];
      parent.children.push(item);
    }
  };

  notes
    .filter((n) => isEmpty(n.notebooks))
    .forEach((n) =>
      items.push({ id: n.id, text: n.name, icon: NOTE_ICON, depth: 0 })
    );
  notebooks.forEach((n) => recursive(n));

  // Must be kept in sync with getNotesForTag, and getNotesForNotebook
  const sorted = orderBy(items, ["name"]);
  const sortedFlat = flatMapDeep(items, (item) =>
    item.children != null ? [item, ...item.children] : [item]
  );

  return [sorted, sortedFlat];
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

export const createNotebook: StoreListener<"sidebar.createNotebook"> = async (
  _,
  ctx
) => {
  const state = ctx.getState();
  const { selected } = state.ui.sidebar;

  let parentId: string | undefined;
  if (selected != null && selected.length > 0) {
    const [type] = parseResourceId(selected[0]);
    if (type === "notebook") {
      parentId = selected[0];
    }
  }

  let siblings: Notebook[] = state.notebooks;
  if (parentId != null) {
    siblings = getNotebookById(siblings, parentId).children!;
  }

  let schema: yup.StringSchema = yup.reach(getNotebookSchema(siblings), "name");
  let inputParams: PromisedInputParams = {
    value: "",
    schema,
    parentId,
    resourceType: "notebook",
  };

  let input = createPromisedInput(inputParams, setExplorerInput(ctx));

  ctx.setUI((prev) => {
    let expanded = prev.sidebar.expanded;
    if (!expanded?.some((id) => id === parentId)) {
      expanded ??= [];
      expanded?.push(parentId!);
    }

    return {
      focused: ["sidebarInput"],
      sidebar: {
        expanded,
        input,
        view: "notebooks",
      },
    };
  });

  const [value, action] = await input.completed;
  if (action === "confirm") {
    try {
      const notebook = await window.ipc("notebooks.create", {
        name: value,
        parentId,
      });
      ctx.setNotebooks((notebooks) => {
        if (parentId != null) {
          const parent = getNotebookById(notebooks, parentId);
          addChild(parent, notebook);
          return [...notebooks];
        } else {
          return [...notebooks, notebook];
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

export const renameNotebook: StoreListener<"sidebar.renameNotebook"> = async (
  { value: id },
  ctx
) => {
  const state = ctx.getState();
  const { name, parent } = getNotebookById(state.notebooks, id);

  let siblings = parent?.children ?? state.notebooks;
  let schema: yup.StringSchema = yup.reach(getNotebookSchema(siblings), "name");
  let input = createPromisedInput(
    {
      id,
      value: name,
      schema,
      resourceType: "notebook",
    },
    setExplorerInput(ctx)
  );

  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      input,
    },
  });

  const [value, action] = await input.completed;
  if (action === "confirm") {
    try {
      const renamed = await window.ipc("notebooks.rename", {
        id,
        name: value,
      });

      ctx.setNotebooks((notebooks) => {
        const notebook = getNotebookById(notebooks, id);

        if (notebook.parent == null) {
          notebooks.splice(
            notebooks.findIndex((n) => n.id === renamed.id),
            1,
            renamed
          );
        } else {
          replaceChild(notebook.parent, notebook, renamed);
        }

        return [...notebooks];
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

export const deleteNotebook: StoreListener<"sidebar.deleteNotebook"> = async (
  { value: id },
  ctx
) => {
  if (id == null) {
    throw Error();
  }

  const { notebooks } = ctx.getState();
  const notebook = getNotebookById(notebooks, id!);
  const res = await promptConfirmAction("delete", `notebook ${notebook.name}`);

  if (res.text === "Yes") {
    await window.ipc("notebooks.delete", { id: notebook.id });
    ctx.setNotebooks((notebooks) => {
      if (notebook.parent != null) {
        // notebook.parent will be a stale reference
        const parent = getNotebookById(notebooks, notebook.parent.id);
        removeChild(parent, notebook);
        return [...notebooks];
      } else {
        return notebooks.filter((n) => n.id !== notebook.id);
      }
    });
  }
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
  let relationships: { notebook?: string; tag?: string } = {};

  const firstSelected = head(selected);
  if (firstSelected != null) {
    const [type] = parseResourceId(firstSelected);

    if (type === "notebook") {
      relationships.notebook = firstSelected;
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
        ...relationships,
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
