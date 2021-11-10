import React, { useContext, useReducer, useState } from "react";
import { generateId } from "../../shared/domain/id";
import { AppContext } from "../App";
import { Focusable } from "./shared/Focusable";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

type GlobalNavigationState = {
  scroll: number;
  width: string;
};

type GlobalNavigationAction =
  | { type: "scroll"; newScroll: number }
  | { type: "resize"; newWidth: string };

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
          <div>Some</div>
          <div>Some</div>
          <div>Some</div>
          <div>Some</div>
          <div>Some</div>
          <div>Some</div>
          <div>Some</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
          <div>Long</div>
        </Scrollable>
      </Focusable>
    </Resizable>
  );
}
