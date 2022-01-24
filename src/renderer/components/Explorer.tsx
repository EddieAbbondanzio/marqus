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
import React, { useContext, useEffect, useRef } from "react";
import { UI, ExplorerView, State } from "../../shared/domain/state";
import { getTagSchema } from "../../shared/domain/schemas";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { NewButton, NewButtonOption } from "./NewButton";
import { Icon } from "./shared/Icon";
import { InlineInput } from "./shared/InlineInput";
import { NavMenu } from "./shared/NavMenu";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";
import { PubSubContext } from "./PubSub";
import { clamp } from "lodash";
import { useKeyboard } from "../io/keyboard";
import { KeyCode } from "../../shared/io/keyCode";

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
  const { explorer } = state.ui.sidebar;

  const setView = (view: ExplorerView) => () =>
    execute("sidebar.setExplorerView", view);
  const isSelected = (id: string) => explorer.selected?.some((s) => s === id);

  const { input, view, items } = explorer;
  let menus: JSX.Element[] = [];
  let selectables: string[] = [];

  if (items != null && view === "tags") {
    // let tagNameSchema;
    // if (input?.mode === "create") {
    //   tagNameSchema = yup.reach(getTagSchema(tags), "name");
    // } else if (input?.mode === "update") {
    //   const otherTags = tags.filter((t) => t.id !== input.id);
    //   tagNameSchema = yup.reach(getTagSchema(otherTags), "name");
    // }

    for (const item of items) {
      const navMenuId = `tag.${item.resourceId}`;

      if (input?.mode === "update" && input.id === item.resourceId) {
        menus.push(
          <InlineInput
            key="create"
            {...input}
            size="is-small"
            // schema={tagNameSchema}
          />
        );
      } else {
        menus.push(
          <NavMenu
            id={navMenuId}
            key={navMenuId}
            name={item.text}
            selected={isSelected(navMenuId)}
            text={item.text}
            onClick={() => execute("sidebar.setSelection", [navMenuId])}
            onBlur={() => execute("sidebar.clearSelection")}
          ></NavMenu>
        );
        selectables.push(navMenuId);
      }
    }

    if (input != null && input.mode === "create") {
      menus.push(
        <InlineInput
          key="create"
          {...input}
          size="is-small"
          // schema={tagNameSchema}
        />
      );
    }
  }

  // Save for reference. For now...
  // menus.push(
  //   <NavigationMenu
  //     name="foo"
  //     text="Foo"
  //     key="1"
  //     children={<NavigationMenu name="foo/bar" text="Nested" />}
  //   />
  // );

  const newButtonClicked = (opt: NewButtonOption) => {
    switch (opt) {
      case "tag":
        execute("sidebar.createTag");
        break;
    }
  };

  const pubsub = useContext(PubSubContext);
  const moveSelectionUp = () => {
    if (explorer.selected == null || explorer.selected.length === 0) {
      setUI({
        sidebar: {
          explorer: {
            selected: selectables.slice(-1),
          },
        },
      });
    } else {
      const curr = selectables.findIndex((s) => s === explorer.selected![0]);
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
  };
  const moveSelectionDown = () => {
    if (explorer.selected == null || explorer.selected.length === 0) {
      setUI({
        sidebar: {
          explorer: {
            selected: selectables.slice(0, 1),
          },
        },
      });
    } else {
      const curr = selectables.findIndex((s) => s === explorer.selected![0]);
      if (curr == -1) {
        throw Error(`Current selectable not found`);
      }

      const next = clamp(curr + 1, 0, selectables.length - 1);
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
  };

  useEffect(() => {
    pubsub.subscribe("sidebar.moveSelectionUp", moveSelectionUp);
    pubsub.subscribe("sidebar.moveSelectionDown", moveSelectionDown);
  }, [explorer]);

  return (
    <div className="is-flex is-flex-grow-1 is-flex-direction-column">
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
