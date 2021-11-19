import {
  faBook,
  faCoffee,
  faFile,
  faStar,
  faTag,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import React, {
  Component,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { generateId } from "../../shared/domain/id";
import { AppContext } from "../App";
import { NavigationMenu } from "./shared/NavigationMenu";
import { Focusable } from "./shared/Focusable";
import { Icon, IconButton } from "./shared/Icon";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";
import { AppState } from "../state";

export interface NavigationItem {
  icon: IconDefinition;
  label: string;
  expanded?: boolean;
  children?: NavigationItem[];
}

export function GlobalNavigation(): JSX.Element {
  const { state, execute } = useContext(AppContext);

  /**
   * Generate the navigation menu components. This isn't something we want
   * to do unless things change so we memo it to save on performace costs
   */
  const menus = useMemo(() => {
    const all = {
      label: "ALL",
      icon: faFile,
    };
    const notebooks = {
      label: "NOTEBOOKS",
      icon: faBook,
    };
    const tags = {
      label: "TAGS",
      icon: faTag,
    };
    const favorites = {
      label: "FAVORITES",
      icon: faStar,
    };
    const trash = {
      label: "TRASH",
      icon: faTrash,
    };

    // TODO: Allow the user to reorder / hide these
    const items: NavigationItem[] = [all, notebooks, tags, favorites, trash];

    // Recursively render the menus
    const mapper = (item: NavigationItem) => (
      <NavigationMenu
        label={item.label}
        icon={item.icon}
        children={item.children?.map(mapper)}
      />
    );
    return items.map(mapper);
  }, [state]);

  const { width, scroll } = state.globalNavigation;

  return (
    <Resizable
      width={width}
      onResize={(newWidth) => execute("globalNavigation.resizeWidth", newWidth)}
    >
      <Focusable>
        <Scrollable
          scroll={scroll}
          onScroll={(newScroll) =>
            execute("globalNavigation.updateScroll", newScroll)
          }
        >
          {menus}
        </Scrollable>
      </Focusable>
    </Resizable>
  );
}
