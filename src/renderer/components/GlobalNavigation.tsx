import {
  faBook,
  faCoffee,
  faFile,
  faStar,
  faTag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useReducer, useState } from "react";
import { generateId } from "../../shared/domain/id";
import { AppContext } from "../App";
import { NavigationMenu } from "./shared/NavigationMenu";
import { Focusable } from "./shared/Focusable";
import { Icon, IconButton } from "./shared/Icon";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export function GlobalNavigation(): JSX.Element {
  const {
    state: { globalNavigation: state },
    execute,
  } = useContext(AppContext);

  return (
    <Resizable
      width={state.width}
      onResize={(newWidth) => execute("globalNavigation.resizeWidth", newWidth)}
    >
      <Focusable>
        <Scrollable
          scroll={state.scroll}
          onScroll={(newScroll) =>
            execute("globalNavigation.updateScroll", newScroll)
          }
        >
          <NavigationMenu label="ALL" icon={faFile}/>
          <NavigationMenu label="NOTEBOOKS" icon={faBook} />
          <NavigationMenu label="TAGS" icon={faTag} />
          <NavigationMenu label="FAVORITES" icon={faStar} />
          <NavigationMenu label="TRASH" icon={faTrash} />
        </Scrollable>
      </Focusable>
    </Resizable>
  );
}
