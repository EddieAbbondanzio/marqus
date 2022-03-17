import React, { useEffect, useMemo } from "react";
import { px } from "../../shared/dom";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuItems,
} from "./shared/ContextMenu";
import { Resizable } from "./shared/Resizable";
import { Focusable } from "./shared/Focusable";
import {
  SidebarInput,
  SidebarMenu,
  NAV_MENU_ATTRIBUTE,
  NAV_MENU_HEIGHT,
} from "./SidebarItems";
import { findParent } from "../utils/findParent";
import { isResourceId, parseResourceId } from "../../shared/domain/id";
import { Store, StoreControls, StoreListener } from "../store";
import styled from "styled-components";
import { THEME } from "../styling/theme";
import { clamp, head, isEmpty, orderBy, take } from "lodash";
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
import { NOTEBOOK_ICON, NOTE_ICON } from "../libs/fontAwesome";
import {
  AwaitableParams,
  createAwaitableInput,
} from "../../shared/awaitableInput";
import { getTagSchema, getTagById, Tag } from "../../shared/domain/tag";
import { NotFoundError, InvalidOpError } from "../../shared/errors";
import { MouseButton } from "../io/mouse";
import { promptError, promptConfirmAction } from "../utils/prompt";
import { Scrollable } from "./shared/Scrollable";
import * as yup from "yup";

export interface SidebarProps {
  store: Store;
}

export function Sidebar({ store }: SidebarProps) {
  const { notes, notebooks } = store.state;
  const { sidebar } = store.state.ui;
  const { input, selected, expanded } = sidebar;

  const items = useMemo(() => getItems(notes, notebooks), [notes, notebooks]);

  // Sanity check
  if (input != null && input.parentId != null) {
    if (!isResourceId(input.parentId)) {
      throw new Error(
        `Explorer input parent id must be a global id. Instead '${input.parentId}' was passed.`
      );
    }
  }

  useEffect(() => {
    store.on("sidebar.resizeWidth", resizeWidth);
    const getNext = (increment: number) => {
      if (isEmpty(selected)) {
        return take(items, 1);
      }
      let next = 0;
      let curr = 0;
      const firstSelected = head(selected)!;
      curr = items.findIndex((s) => s.id === firstSelected);
      if (curr === -1) {
        throw new NotFoundError(`No selectable ${firstSelected} found`);
      }

      next = clamp(curr + increment, 0, items.length - 1);
      return items.slice(next, next + 1);
    };

    const updateSelected: StoreListener<
      | "sidebar.clearSelection"
      | "sidebar.moveSelectionDown"
      | "sidebar.moveSelectionUp"
      | "sidebar.setSelection"
    > = async ({ type, value }, { setUI }) => {
      let selected: SidebarItem[] | undefined;
      let content: string | undefined;
      let noteId: string | undefined;

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
            selected = [items.find((i) => i.id === value[0])!];
          }
          break;
      }

      if (selected != null && selected.length == 1) {
        const [firstSelected] = selected;
        if (firstSelected == null) {
          return;
        }
        const [type, id] = parseResourceId(firstSelected.id);

        if (type === "note") {
          content =
            (await window.ipc("notes.loadContent", firstSelected.id)) ??
            undefined;
          noteId = firstSelected.id;
        }
      }

      setUI((prev) => {
        const next = {
          ...prev,
        };

        if (noteId != null) {
          if (content == null) {
            throw new Error(
              `Cannot load note content. Content was null for ${noteId}`
            );
          }

          next.editor.content = content;
          next.editor.noteId = noteId;
        }

        // TODO: Add multiple select support
        next.sidebar.selected = [selected![0].id];
        return next;
      });
    };

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
    store.on(["sidebar.createTag", "sidebar.renameTag"], createOrRenameTag);
    store.on("sidebar.deleteTag", deleteTag);
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
      store.off(["sidebar.createTag", "sidebar.renameTag"], createOrRenameTag);
      store.off("sidebar.deleteTag", deleteTag);
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
    parent?: SidebarItem,
    depth: number = 0
  ): JSX.Element[] => {
    let rendered: JSX.Element[] = [];

    for (const item of items) {
      let children;
      if (hasChildren(item, input)) {
        children = renderMenus(item.children ?? [], item, depth + 1);
      }

      if (input?.mode === "update" && input.id === item.id) {
        rendered.push(
          <SidebarInput
            store={store}
            key="create"
            size="is-small"
            {...input}
            depth={depth}
          />
        );
      } else {
        const isExpanded = expanded?.some((id) => id === item.id);

        const onClick = (button: MouseButton) => {
          if (button & MouseButton.Left && hasChildren(item, input)) {
            store.dispatch("sidebar.toggleItemExpanded", item.id);
          }
          // We always want to do this
          store.dispatch("sidebar.setSelection", [item.id]);
        };

        rendered.push(
          <SidebarMenu
            id={item.id}
            key={item.id}
            selected={selected?.some((s) => s === item.id)}
            text={item.text}
            onClick={onClick}
            children={children}
            icon={item.icon}
            expanded={isExpanded}
            depth={depth}
          />
        );
      }
    }

    if (input?.mode === "create") {
      console.log("INPUT!");
      if (input?.parentId == parent?.id) {
        rendered.push(
          <SidebarInput
            store={store}
            key="create"
            size="is-small"
            {...input}
            depth={depth}
          />
        );
      }
    }

    return rendered;
  };
  const menus = renderMenus(items);

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
          <Scrollable
            scroll={store.state.ui.sidebar.scroll}
            onScroll={(s) => store.dispatch("sidebar.updateScroll", s)}
          >
            {menus}
          </Scrollable>
        </ContextMenu>
      </StyledFocusable>
    </StyledResizable>
  );
}

export const StyledResizable = styled(Resizable)`
  background-color: ${THEME.sidebar.background};
`;

export const StyledFocusable = styled(Focusable)`
  width: 100%;
  height: 100%;
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
    (el) => el.hasAttribute(NAV_MENU_ATTRIBUTE),
    {
      matchValue: (el) => el.getAttribute(NAV_MENU_ATTRIBUTE),
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
export function hasChildren(item: SidebarItem, input?: any): boolean {
  return Boolean(item.children?.length ?? 0 > 0) || item.id === input?.parentId;
}

export function getItems(notes: Note[], notebooks: Notebook[]): SidebarItem[] {
  let items: SidebarItem[] = [];

  const recursive = (n: Notebook, parent?: SidebarItem) => {
    const item: SidebarItem = {
      id: n.id,
      text: n.name,
      icon: NOTEBOOK_ICON,
    };

    if (n.children != null && n.children.length > 0) {
      n.children.forEach((n) => recursive(n, item));
    }

    // Children are listed after nested notebooks
    const itemNotes = getNotesForNotebook(notes, n);
    item.children ??= [];
    item.children.push(
      ...itemNotes.map((n) => ({
        id: n.id,
        text: n.name,
        icon: NOTE_ICON,
      }))
    );

    if (parent == null) {
      items.push(item);
    } else {
      parent.children ??= [];
      parent.children.push(item);
    }
  };

  notes
    .filter(isEmpty)
    .forEach((n) => items.push({ id: n.id, text: n.name, icon: NOTE_ICON }));
  notebooks.forEach((n) => recursive(n));

  // Must be in kept in sync with getNotesForTag, and getNotesForNotebook
  return orderBy(items, ["name"]);
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
    const scroll = Math.max(prev.sidebar.scroll - NAV_MENU_HEIGHT, 0);
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
    const scroll = prev.sidebar.scroll + NAV_MENU_HEIGHT;
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

export const createOrRenameTag: StoreListener<
  "sidebar.createTag" | "sidebar.renameTag"
> = async ({ type, value: id }, ctx) => {
  let { tags } = ctx.getState();
  const otherTags =
    type == "sidebar.renameTag" ? tags.filter((t) => t.id !== id) : tags;
  let schema: yup.StringSchema = yup.reach(getTagSchema(otherTags), "name");

  let inputParams: AwaitableParams = { value: "", schema };
  if (type == "sidebar.renameTag") {
    const tag = getTagById(tags, id!);
    inputParams.id = tag.id;
    inputParams.value = tag.name;
  }

  let input = createAwaitableInput(inputParams, setExplorerInput(ctx));

  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      input,
    },
  });

  const [name, action] = await input.completed;
  if (action === "confirm") {
    let tag: Tag;
    try {
      switch (type) {
        case "sidebar.createTag":
          tag = await window.ipc("tags.create", { name });
          ctx.setTags((tags) => [...tags, tag]);
          break;

        case "sidebar.renameTag":
          tag = await window.ipc("tags.rename", { id: id!, name });
          ctx.setTags((tags) => {
            tags.splice(
              tags.findIndex((t) => t.id === tag.id),
              1,
              tag
            );
            return [...tags];
          });
          break;

        default:
          throw new InvalidOpError(`Invalid tag ipc ${type}`);
      }
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

export const deleteTag: StoreListener<"sidebar.deleteTag"> = async (
  { value: id },
  ctx
) => {
  if (id == null) {
    throw Error();
  }

  const { tags } = ctx.getState();
  const tag = getTagById(tags, id!);
  const res = await promptConfirmAction("delete", `tag ${tag.name}`);

  if (res.text === "Yes") {
    await window.ipc("tags.delete", { id: tag.id });
    ctx.setTags((tags) => tags.filter((t) => t.id !== tag.id));
  }
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
  let inputParams: AwaitableParams = { value: "", schema, parentId };

  let input = createAwaitableInput(inputParams, setExplorerInput(ctx));

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
  let input = createAwaitableInput(
    {
      id,
      value: name,
      schema,
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

  console.log("CREATE NOTE");

  const firstSelected = head(selected);
  if (firstSelected != null) {
    const [type] = parseResourceId(firstSelected);

    if (type === "notebook") {
      relationships.notebook = firstSelected;
      parentId = firstSelected;
    }
  }

  let input = createAwaitableInput(
    {
      schema,
      parentId,
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
  let inputParams: AwaitableParams = {
    id,
    value,
    schema,
  };

  let input = createAwaitableInput(inputParams, setExplorerInput(ctx));

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
