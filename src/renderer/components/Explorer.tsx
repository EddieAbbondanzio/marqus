import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo } from "react";
import { ExplorerView, State, ExplorerItem } from "../state";
import { NewButton, NewButtonOption } from "./NewButton";
import { Icon } from "./shared/Icon";
import { ExplorerInput, ExplorerMenu, NAV_MENU_HEIGHT } from "./ExplorerItems";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";
import {
  InvalidOpError,
  NotFoundError,
  NotImplementedError,
} from "../../shared/errors";
import { isResourceId, parseResourceId } from "../../shared/domain/id";
import {
  Note,
  getNotesForTag,
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
} from "../../shared/domain/notebook";
import { getTagById, getTagSchema, Tag } from "../../shared/domain/tag";
import {
  FAVORITE_ICON,
  NOTEBOOK_ICON,
  NOTE_ICON,
  TAG_ICON,
  TRASH_ICON,
} from "../libs/fontAwesome";
import { MouseButton } from "../io/mouse";
import {
  EventType,
  EventValue,
  Store,
  StoreControls,
  StoreListener,
} from "../store";
import { head, clamp, isEmpty, take } from "lodash";
import {
  AwaitableParams,
  createAwaitableInput,
} from "../../shared/awaitableInput";
import { promptError, promptConfirmAction } from "../utils/prompt";
import * as yup from "yup";
import { AnyKey } from "tsdef";
import { string } from "yup/lib/locale";

export const EXPLORER_DESC: Record<ExplorerView, string> = {
  all: "All",
  favorites: "Favorites",
  notebooks: "By notebook",
  tags: "By tag",
  temp: "Temporary",
  trash: "Trash",
};

export interface ExplorerProps {
  store: Store;
}

export function Explorer({ store }: ExplorerProps) {
  const { notes, tags, notebooks } = store.state;
  const { explorer } = store.state.ui.sidebar;
  const { input, view, selected, expanded } = explorer;

  const [items, selectables] = useMemo(
    () => getExplorerItems(view, notes, notebooks, tags),
    [view, notes, notebooks, tags]
  );

  // Sanity check
  if (input != null && input.parentId != null) {
    if (!isResourceId(input.parentId)) {
      throw new Error(
        `Explorer input parent id must be a global id. Instead '${input.parentId}' was passed.`
      );
    }
  }

  // Recursively renders
  const renderMenus = (
    items: ExplorerItem[],
    parent?: ExplorerItem,
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
          <ExplorerInput
            name="sidebarInput"
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
            console.log("toggle: ", item);
          }
          // We always want to do this
          store.dispatch("sidebar.setSelection", [item.id]);
        };

        rendered.push(
          <ExplorerMenu
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
      if (input?.parentId == parent?.id) {
        rendered.push(
          <ExplorerInput
            name="sidebarInput"
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

  const newButtonClicked = (opt: NewButtonOption) => {
    switch (opt) {
      case "tag":
        store.dispatch("sidebar.createTag");
        break;
      case "note":
        store.dispatch("sidebar.createNote");
        break;
      case "notebook":
        store.dispatch("sidebar.createNotebook", {});
        break;
      default:
        throw new InvalidOpError(`New button clicked for type: '${opt}'`);
    }
  };

  const setView = (view: ExplorerView) => () =>
    store.dispatch("sidebar.setExplorerView", view);

  useEffect(() => {
    const getNext = (increment: number) => {
      if (isEmpty(selected)) {
        return take(selectables, 1);
      }
      let next = 0;
      let curr = 0;

      const firstSelected = head(selected)!;
      curr = selectables.findIndex((s) => s === firstSelected);
      if (curr === -1) {
        throw new NotFoundError(`No selectable ${firstSelected} found`);
      }

      next = clamp(curr + increment, 0, selectables.length - 1);
      return selectables.slice(next, next + 1);
    };
    const updateSelected: StoreListener<
      | "sidebar.clearSelection"
      | "sidebar.moveSelectionDown"
      | "sidebar.moveSelectionUp"
    > = ({ type }, { setUI }) =>
      setUI(() => {
        let selected;
        switch (type) {
          case "sidebar.moveSelectionDown":
            selected = getNext(1);
            break;
          case "sidebar.moveSelectionUp":
            selected = getNext(-1);
            break;
        }
        return {
          sidebar: {
            explorer: {
              selected,
            },
          },
        };
      });

    store.on("sidebar.scrollUp", scrollUp);
    store.on("sidebar.scrollDown", scrollDown);
    store.on("sidebar.updateScroll", updateScroll);
    store.on("sidebar.toggleItemExpanded", toggleItemExpanded);
    store.on(
      [
        "sidebar.moveSelectionUp",
        "sidebar.moveSelectionDown",
        "sidebar.clearSelection",
      ],
      updateSelected
    );

    return () => {
      store.off("sidebar.scrollUp", scrollUp);
      store.off("sidebar.scrollDown", scrollDown);
      store.off("sidebar.updateScroll", updateScroll);
      store.off("sidebar.toggleItemExpanded", toggleItemExpanded);
      store.off(
        [
          "sidebar.moveSelectionUp",
          "sidebar.moveSelectionDown",
          "sidebar.clearSelection",
        ],
        updateSelected
      );
    };
  }, [store.state]);

  return (
    <div className="is-flex is-flex-grow-1 is-flex-direction-column h-100">
      <Tabs alignment="is-centered" className="mb-2">
        <Tab title="All" isActive={view === "all"} onClick={setView("all")}>
          <Icon icon={NOTE_ICON} />
        </Tab>
        <Tab
          title="Notebooks"
          isActive={view === "notebooks"}
          onClick={setView("notebooks")}
        >
          <Icon icon={NOTEBOOK_ICON} />
        </Tab>
        <Tab title="Tags" isActive={view === "tags"} onClick={setView("tags")}>
          <Icon icon={TAG_ICON} />
        </Tab>
        <Tab
          title="Favorites"
          isActive={view === "favorites"}
          onClick={setView("favorites")}
        >
          <Icon icon={FAVORITE_ICON} />
        </Tab>
        <Tab
          title="Trash"
          isActive={view === "trash"}
          onClick={setView("trash")}
        >
          <Icon icon={TRASH_ICON} />
        </Tab>
      </Tabs>

      {/* Keep this out of scrollable */}
      <div className="px-2 pb-2 is-flex is-justify-content-space-between is-align-items-center has-border-bottom-1-light ">
        <p className="is-size-7">
          <span className="has-text-dark is-uppercase">Explorer</span>
          <span className="has-text-grey is-italic">
            {" "}
            - {EXPLORER_DESC[view]}
          </span>
        </p>

        <div className="is-flex is-align-items-center">
          <NewButton onClick={newButtonClicked} />

          <a>
            <Icon
              icon={faAngleDoubleDown}
              color="is-dark"
              size="is-small"
              title="Expand All"
              className="mr-1"
            />
          </a>
          <a>
            <Icon
              icon={faAngleDoubleUp}
              color="is-dark"
              title="Collapse All"
              size="is-small"
            />
          </a>
        </div>
      </div>

      <Scrollable
        scroll={store.state.ui.sidebar.scroll}
        onScroll={(s) => store.dispatch("sidebar.updateScroll", s)}
      >
        {menus}
      </Scrollable>
    </div>
  );
}

/**
 * Checks if the explorer item has children to render. This will also
 * include nested inputs.
 * @returns True if there are any children or an input
 */
export function hasChildren(item: ExplorerItem, input?: any): boolean {
  return Boolean(item.children?.length ?? 0 > 0) || item.id === input?.parentId;
}

// Move this to a better spot later
export function getExplorerItems(
  view: ExplorerView,
  notes: Note[],
  notebooks: Notebook[],
  tags: Tag[]
): [ExplorerItem[], string[]] {
  let items: ExplorerItem[] = [];
  let selectables: string[] = [];

  switch (view) {
    case "all":
      notes.forEach((n) => {
        items.push({
          id: n.id,
          text: n.name,
          icon: NOTE_ICON,
        });
        selectables.push(n.id);
      });
      break;

    case "tags":
      tags.forEach((t) => {
        const children = getNotesForTag(notes, t).map((n) => ({
          id: n.id,
          text: n.name,
          icon: NOTE_ICON,
        }));

        items.push({
          id: t.id,
          text: t.name,
          icon: TAG_ICON,
          children,
        });
        selectables.push(t.id, ...children.map((c) => c.id));
      });
      break;

    case "notebooks":
      const recursive = (n: Notebook, parent?: ExplorerItem) => {
        selectables.push(n.id);

        const item: ExplorerItem = {
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
      notebooks.forEach((n) => recursive(n));
      break;
  }

  return [items, selectables];
}

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
export const scrollUp: StoreListener<"sidebar.scrollUp"> = (ev, ctx) => {
  ctx.setUI((prev) => {
    const scroll = Math.max(prev.sidebar.scroll - NAV_MENU_HEIGHT, 0);
    return {
      sidebar: {
        scroll,
      },
    };
  });
};
export const scrollDown: StoreListener<"sidebar.scrollDown"> = (ev, ctx) => {
  ctx.setUI((prev) => {
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
  if (id == null) {
    throw Error();
  }

  ctx.setUI((prev) => {
    const { explorer } = prev.sidebar;
    if (explorer.expanded == null || explorer.expanded.length == 0) {
      explorer.expanded = [id];
      return prev;
    }

    const exists = explorer.expanded.some((expandedId) => expandedId === id);
    if (exists) {
      explorer.expanded = explorer.expanded.filter(
        (expandedId) => expandedId !== id
      );
    } else {
      explorer.expanded.push(id);
    }

    return prev;
  });
};

export const createTag: StoreListener<
  "sidebar.createTag" | "sidebar.renameTag"
> = async ({ value: id }, ctx) => {
  let isRename = id != null;
  let { tags } = ctx.getState();
  const otherTags = isRename ? tags.filter((t) => t.id !== id) : tags;
  let schema: yup.StringSchema = yup.reach(getTagSchema(otherTags), "name");

  let inputParams: AwaitableParams = { value: "", schema };
  if (isRename) {
    const tag = getTagById(tags, id!);
    inputParams.id = tag.id;
    inputParams.value = tag.name;
  }

  let input = createAwaitableInput(inputParams, (value) =>
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

  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      explorer: {
        input,
        view: "tags",
      },
    },
  });

  const [value, action] = await input.completed;
  if (action === "confirm") {
    try {
      const tag = await window.rpc("tags.create", { name: value });
      ctx.setTags((tags) => [...tags, tag]);
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      explorer: {
        input: undefined,
      },
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
    await window.rpc("tags.delete", { id: tag.id });
    ctx.setTags((tags) => tags.filter((t) => t.id !== tag.id));
  }
};

export const createNotebook: StoreListener<
  "sidebar.createNotebook" | "sidebar.renameNotebook"
> = async (ev, ctx) => {
  let isRename = ev.type == "sidebar.renameNotebook";
  const { id, parent } = ev.value as { id?: string; parent?: string };

  const state = ctx.getState();
  const { selected } = state.ui.sidebar.explorer;

  let parentId: string | undefined;
  if (selected != null && selected.length > 0) {
    const [type] = parseResourceId(selected[0]);
    if (type === "notebook") {
      parentId = selected[0];
    }
  }

  let siblings =
    parentId == null
      ? state.notebooks
      : getNotebookById(state.notebooks, parentId).children!;
  let schema: yup.StringSchema = yup.reach(getNotebookSchema(siblings), "name");

  let inputParams: AwaitableParams = { value: "", schema };
  if (isRename) {
    let notebook = getNotebookById(state.notebooks, id!);
    inputParams.id = notebook.id;
    inputParams.value = notebook.name;
  }

  let input = createAwaitableInput(inputParams, (value) =>
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

  ctx.setUI((prev) => {
    // Auto expand parent if one was passed.
    let expanded = prev.sidebar.explorer.expanded;
    if (parentId != null && !expanded?.some((id) => id === parentId)) {
      expanded ??= [];
      expanded?.push(parentId);
    }

    return {
      focused: ["sidebarInput"],
      sidebar: {
        explorer: {
          expanded,
          input: {
            ...input,
            parentId,
          },
          view: "notebooks",
        },
      },
    };
  });

  const [value, action] = await input.completed;
  if (action === "confirm") {
    try {
      if (ev.type == "sidebar.createNotebook") {
        const notebook = await window.rpc("notebooks.create", {
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
      } else {
        let notebook = getNotebookById(state.notebooks, id!);
        const renamed = await window.rpc("notebooks.update", {
          id: notebook.id,
          name: value,
        });
        ctx.setNotebooks((notebooks) => {
          if (notebook.parent == null) {
            const index = notebooks.findIndex((n) => n.id === renamed.id);
            notebooks.splice(index, 1, renamed);
            console.log("renamed: ", renamed);
          } else {
            const parent = notebook.parent;
            const index = parent.children!.findIndex(
              (n) => n.id === renamed.id
            );
            parent.children!.splice(index, 1, renamed);
            renamed.parent = parent;
          }

          return [...notebooks];
        });
      }
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      explorer: {
        input: undefined,
      },
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
    await window.rpc("notebooks.delete", { id: notebook.id });
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

export const createOrRenameNote: StoreListener<
  "sidebar.createNote" | "sidebar.renameNote"
> = async (ev, ctx) => {
  let { id } = ev as any;
  let isRename = id == null;

  const { notes } = ctx.getState();
  let schema: yup.StringSchema = yup.reach(getNoteSchema(notes), "name");
  let inputParams: AwaitableParams = {
    value: "",
    schema,
  };

  if (isRename) {
    let note = getNoteById(notes, id!);
    inputParams.id = note.id;
    inputParams.value = note.name;
  }

  let input = createAwaitableInput(inputParams, (value) =>
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

  // TODO: We'll need to allow renaming notes in any view (except trash)
  ctx.setUI({
    focused: ["sidebarInput"],
    sidebar: {
      explorer: {
        input,
        view: "all",
      },
    },
  });

  const [value, action] = await input.completed;
  if (action === "confirm") {
    try {
      if (!isRename) {
        // TODO: Add multi-select support
        const { selected } = ctx.getState().ui.sidebar.explorer;
        let view: ExplorerView = "all";
        let tag;
        let notebook;
        let parentId;
        if (selected != null && selected.length > 0) {
          const firstSelected = head(selected)!;
          const [type, id] = parseResourceId(firstSelected);
          parentId = firstSelected;

          switch (type) {
            case "notebook":
              view = "notebooks";
              notebook = id;
              break;

            case "tag":
              view = "tags";
              tag = id;
              break;
          }
        }

        const note = await window.rpc("notes.create", {
          name: value,
          notebook,
          tag,
        });
        ctx.setNotes((notes) => [...notes, note]);
      } else {
        let note = getNoteById(notes, id!);
        const newNote = await window.rpc("notes.update", {
          id: note.id,
          name: value,
        });
        ctx.setNotes((notes) => {
          const index = notes.findIndex((n) => n.id === note.id);
          notes.splice(index, 1, newNote);
          console.log("new note name: ", newNote.name);
          return [...notes];
        });
      }
    } catch (e) {
      promptError(e.message);
    }
  }

  ctx.setUI({
    sidebar: {
      explorer: {
        input: undefined,
      },
    },
  });
};

export const deleteNote: StoreListener<"sidebar.deleteNote"> = (
  { value: id },
  ctx
) => {
  throw new NotImplementedError();
};

export const setSelection: StoreListener<"sidebar.setSelection"> = (
  { value: selected },
  ctx
) => {
  if (selected == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      explorer: {
        selected,
      },
    },
  });
};

export const clearSelection: StoreListener<"sidebar.clearSelection"> = (
  _,
  ctx
) => {
  const {
    ui: {
      sidebar: {
        explorer: { selected },
      },
    },
  } = ctx.getState();

  if (!isEmpty(selected)) {
    ctx.setUI({
      sidebar: {
        explorer: {
          selected: [],
        },
      },
    });
  }
};

export const setExplorerView: StoreListener<"sidebar.setExplorerView"> = (
  { value: view },
  ctx
) => {
  if (view == null) {
    throw Error();
  }

  ctx.setUI({
    sidebar: {
      explorer: {
        view,
        input: undefined,
        selected: undefined,
      },
    },
  });
};
