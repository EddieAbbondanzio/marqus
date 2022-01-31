import {
  faFile,
  faBook,
  faTag,
  faStar,
  faClock,
  faTrash,
  faAngleDoubleDown,
  faAngleDoubleUp,
} from "@fortawesome/free-solid-svg-icons";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  UI,
  ExplorerView,
  State,
  ExplorerInput,
  ExplorerItem,
} from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { NewButton, NewButtonOption } from "./NewButton";
import { Icon } from "./shared/Icon";
import { InlineInput } from "./shared/InlineInput";
import { NavMenu } from "./shared/NavMenu";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";
import { InvalidOpError } from "../../shared/errors";
import { globalId, parseGlobalId } from "../../shared/domain/id";
import { Note, getNotesForTag } from "../../shared/domain/note";
import { Notebook } from "../../shared/domain/notebook";
import { Tag } from "../../shared/domain/tag";

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
  const { input, view, selected } = explorer;

  const [items] = useMemo(
    () => getExplorerItems(view, notes, notebooks, tags),
    [view, notes, notebooks, tags]
  );

  // Recursively renders
  const renderMenus = (
    items: ExplorerItem[],
    parent?: ExplorerItem
  ): JSX.Element[] => {
    let rendered: JSX.Element[] = [];

    for (const item of items) {
      const [, id] = parseGlobalId(item.globalId);
      let children;
      if (hasChildren(item, input)) {
        children = renderMenus(item.children ?? [], item);
      }

      if (input?.mode === "update" && input.id === id) {
        rendered.push(
          <InlineInput
            name="sidebarInput"
            key="create"
            size="is-small"
            {...input}
          />
        );
      } else {
        rendered.push(
          <NavMenu
            id={item.globalId}
            key={item.globalId}
            selected={selected?.some((s) => s === item.globalId)}
            text={item.text}
            onClick={() => execute("sidebar.setSelection", [item.globalId])}
            children={children}
          />
        );
      }
    }

    if (input?.mode === "create") {
      if (input?.parentGlobalId == parent?.globalId) {
        rendered.push(
          <InlineInput
            name="sidebarInput"
            key="create"
            size="is-small"
            {...input}
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
          <Icon icon={faFile} />
        </Tab>
        <Tab
          title="Notebooks"
          isActive={view === "notebooks"}
          onClick={setView("notebooks")}
        >
          <Icon icon={faBook} />
        </Tab>
        <Tab title="Tags" isActive={view === "tags"} onClick={setView("tags")}>
          <Icon icon={faTag} />
        </Tab>
        <Tab
          title="Favorites"
          isActive={view === "favorites"}
          onClick={setView("favorites")}
        >
          <Icon icon={faStar} />
        </Tab>
        <Tab
          title="Trash"
          isActive={view === "trash"}
          onClick={setView("trash")}
        >
          <Icon icon={faTrash} />
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
export function hasChildren(
  item: ExplorerItem,
  input?: ExplorerInput
): boolean {
  return (
    Boolean(item.children?.length ?? 0 > 0) ||
    item.globalId === input?.parentGlobalId
  );
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
        const id = globalId("note", n.id);
        items.push({
          globalId: id,
          text: n.name,
        });
        selectables.push(id);
      });
      break;

    case "tags":
      tags.forEach((t) => {
        const id = globalId("tag", t.id);
        const children = getNotesForTag(notes, t.id).map((n) => ({
          globalId: globalId("note", n.id),
          text: n.name,
        }));

        items.push({
          globalId: id,
          text: t.name,
          children,
        });
        selectables.push(id, ...children.map((c) => c.globalId));
      });
      break;

    case "notebooks":
      const recursisve = (n: Notebook) => {
        const id = globalId("notebook", n.id);
        const item: ExplorerItem = {
          globalId: id,
          text: n.name,
        };
        items.push(item);
        selectables.push(id);

        let children;
        if (n.children != null && n.children.length > 0) {
          n.children.forEach(recursisve);
          item.children = children;
        }
      };
      notebooks.forEach(recursisve);
      break;
  }

  return [items, selectables];
}