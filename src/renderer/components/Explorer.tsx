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
} from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { NewButton, NewButtonOption } from "./NewButton";
import { Icon } from "./shared/Icon";
import { InlineInput } from "./shared/InlineInput";
import { NavMenu } from "./shared/NavMenu";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";
import { PubSubContext } from "./PubSub";
import { clamp, head } from "lodash";
import { InvalidOpError } from "../../shared/errors";
import { fullyQualifyId, parseFullyQualifiedId } from "../../shared/utils";
import { Note, Notebook } from "../../shared/domain/entities";

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

export interface ExplorerItem {
  id: string;
  text: string;
  children?: ExplorerItem[];
}

export function Explorer({ state, setUI, execute }: ExplorerProps) {
  const { notes, tags, notebooks } = state;
  const { explorer } = state.ui.sidebar;
  const { input, view, selected } = explorer;

  /*
   * items are nested
   * selectables are flat for easy traversal
   */
  const [items, selectables] = useMemo(() => {
    let items: ExplorerItem[] = [];
    let selectables: string[] = [];

    switch (view) {
      case "all":
        notes.forEach((n) => {
          const id = fullyQualifyId("note", n.id);
          items.push({
            id,
            text: n.name,
          });
          selectables.push(id);
        });
        break;

      case "tags":
        tags.forEach((t) => {
          const id = fullyQualifyId("tag", t.id);
          const children = getNotesForTag(notes, t.id).map((n) => ({
            id: fullyQualifyId("note", n.id),
            text: n.name,
          }));

          items.push({
            id,
            text: t.name,
            children,
          });
          selectables.push(id, ...children.map((c) => c.id));
        });
        break;

      case "notebooks":
        const recursisve = (n: Notebook) => {
          const id = fullyQualifyId("notebook", n.id);
          const item: ExplorerItem = {
            id,
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
  }, [view, notes, tags, notebooks]);

  const renderMenus = (
    items: ExplorerItem[],
    parent?: ExplorerItem
  ): JSX.Element[] => {
    let rendered: JSX.Element[] = [];

    for (const item of items) {
      const [, id] = parseFullyQualifiedId(item.id);
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
            id={item.id}
            key={item.id}
            selected={selected?.some((s) => s === item.id)}
            text={item.text}
            onClick={() => execute("sidebar.setSelection", [item.id])}
            children={children}
          />
        );
      }
    }

    if (input?.mode === "create") {
      if (input?.parentId == parent?.id) {
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

  const moveSelectionUp = useCallback(() => {
    if ((selected?.length ?? 0) === 0) {
      setUI({
        sidebar: {
          explorer: {
            selected: selectables.slice(-1),
          },
        },
      });
    } else {
      const curr = selectables.findIndex((s) => s === selected![0]);
      if (curr == -1) {
        throw Error(`Current selectable not found`);
      }

      const next = clamp(curr - 1, 0, selectables.length - 1);
      if (curr !== next) {
        setUI({
          sidebar: {
            explorer: {
              selected: selectables.slice(next, next + 1),
            },
          },
        });
      }
    }
  }, [selectables, items, selected]);
  console.log("explorer() selected: ", selected);
  const moveSelectionDown = useCallback(() => {
    let nextIndex = 0;
    let currIndex;
    if (selected != null && selected.length > 0) {
      currIndex = selectables.findIndex((s) => s === head(selected));
      if (currIndex == -1) {
        throw Error(`Current selectable not found`);
      }

      nextIndex = clamp(currIndex + 1, 0, selectables.length - 1);
      if (nextIndex == currIndex) {
        return;
      }
    }

    setUI({
      sidebar: {
        explorer: {
          selected: selectables.slice(nextIndex, nextIndex + 1),
        },
      },
    });
  }, [selectables, items, selected]);

  const pubsub = useContext(PubSubContext);
  useEffect(() => {
    console.log("sub");
    pubsub.subscribe("sidebar.moveSelectionUp", moveSelectionUp);
    pubsub.subscribe("sidebar.moveSelectionDown", moveSelectionDown);
  }, []);

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
  return Boolean(item.children?.length ?? 0 > 0) || item.id === input?.parentId;
}

export function getNotesForTag(notes: Note[], tagId: string) {
  return notes.filter((n) => n.tags?.some((t) => t === tagId));
}
