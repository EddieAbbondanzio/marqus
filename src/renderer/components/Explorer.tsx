import {
  faFile,
  faBook,
  faTag,
  faStar,
  faClock,
  faTrash,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { px } from "../../shared/dom";
import { ExplorerView, State } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { NewButton } from "./NewButton";
import { Button } from "./shared/Button";
import { Dropdown } from "./shared/Dropdown";
import { Icon } from "./shared/Icon";
import { NavigationMenu } from "./shared/NavigationMenu";
import { Scrollable } from "./shared/Scrollable";
import { Tab, Tabs } from "./shared/Tabs";

export interface ExplorerProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Explorer({ state, setUI, execute }: ExplorerProps) {
  const active = state.ui.sidebar.explorer.view;
  const setActive = (view: ExplorerView) => () =>
    execute("sidebar.setExplorerView", view);

  // const menus = state.ui.sidebar.explorer.menus;
  // let menuComps = [];

  // for (const menu of menus) {
  //   menuComps.push(
  //     <NavigationMenu name={menu.name} trigger={undefined} collapsed={false} />
  //   );
  // }

  // console.log("render these: ", menus);

  let menus = [];
  menus.push(
    <NavigationMenu
      name="foo"
      text="Foo"
      key="1"
      children={<NavigationMenu name="foo/bar" text="Nested" />}
    />
  );
  menus.push(<NavigationMenu name="foo" text="Bar" key="2" />);
  menus.push(<NavigationMenu name="foo" text="Baz" key="3" />);

  return (
    <div className="is-flex is-flex-grow-1 is-flex-direction-column">
      <Tabs alignment="is-centered" className="mb-2">
        <Tab title="All" isActive={active === "all"} onClick={setActive("all")}>
          <Icon icon={faFile} />
        </Tab>
        <Tab
          title="Notebooks"
          isActive={active === "notebooks"}
          onClick={setActive("notebooks")}
        >
          <Icon icon={faBook} />
        </Tab>
        <Tab
          title="Tags"
          isActive={active === "tags"}
          onClick={setActive("tags")}
        >
          <Icon icon={faTag} />
        </Tab>
        <Tab
          title="Favorites"
          isActive={active === "favorites"}
          onClick={setActive("favorites")}
        >
          <Icon icon={faStar} />
        </Tab>
        <Tab
          title="Temporary"
          isActive={active === "temp"}
          onClick={setActive("temp")}
        >
          <Icon icon={faClock} />
        </Tab>
        <Tab
          title="Trash"
          isActive={active === "trash"}
          onClick={setActive("trash")}
        >
          <Icon icon={faTrash} />
        </Tab>
      </Tabs>

      {/* Keep this out of scrollable */}
      <div className="px-2 is-flex is-justify-content-space-between is-align-items-center">
        <p className="is-size-7">
          <span className="has-text-dark is-uppercase">Explorer</span>
          <span className="has-text-grey is-italic">
            {" "}
            - {EXPLORER_DESC[active]}
          </span>
        </p>

        <div className="is-flex is-align-items-center">
          <NewButton state={state} setUI={setUI} execute={execute} />

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

export const EXPLORER_DESC: Record<ExplorerView, string> = {
  all: "All",
  favorites: "Favorites",
  notebooks: "By notebooks",
  tags: "By tags",
  temp: "Temporary",
  trash: "Trash",
};
