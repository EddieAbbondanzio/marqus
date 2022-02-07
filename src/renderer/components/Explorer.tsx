import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from "@fortawesome/free-solid-svg-icons";
import React, { useMemo } from "react";
import { ExplorerView, State, ExplorerItem } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { NewButton, NewButtonOption } from "./NewButton";
import { Icon } from "./shared/Icon";
import { ExplorerInput, ExplorerMenu } from "./ExplorerItems";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";
import { InvalidOpError } from "../../shared/errors";
import {
  resourceId,
  isResourceId,
  parseResourceId,
} from "../../shared/domain/id";
import {
  Note,
  getNotesForTag,
  getNotesForNotebook,
} from "../../shared/domain/note";
import { Notebook } from "../../shared/domain/notebook";
import { Tag } from "../../shared/domain/tag";
import {
  FAVORITE_ICON,
  NOTEBOOK_ICON,
  NOTE_ICON,
  TAG_ICON,
  TRASH_ICON,
} from "../libs/fontAwesome";
import { MouseButton } from "../io/mouse";

export const EXPLORER_DESC: Record<ExplorerView, string> = {
  all: "All",
  favorites: "Favorites",
  notebooks: "By notebook",
  tags: "By tag",
  temp: "Temporary",
  trash: "Trash",
};

export interface ExplorerProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Explorer({ state, setUI, execute }: ExplorerProps) {
  const { notes, tags, notebooks } = state;
  const { explorer } = state.ui.sidebar;
  const { input, view, selected, expanded } = explorer;

  const [items] = useMemo(
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
            execute("sidebar.toggleExpanded", item.id);
            console.log("toggle: ", item);
          }
          // We always want to do this
          execute("sidebar.setSelection", [item.id]);
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
        execute("sidebar.createTag");
        break;
      case "note":
        execute("sidebar.createNote");
        break;
      case "notebook":
        execute("sidebar.createNotebook");
        break;
      default:
        throw new InvalidOpError(`New button clicked for type: '${opt}'`);
    }
  };

  const setView = (view: ExplorerView) => () =>
    execute("sidebar.setExplorerView", view);
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
        scroll={state.ui.sidebar.scroll}
        onScroll={(s) => execute("sidebar.updateScroll", s)}
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
