import React, { useContext, useReducer } from "react";
import { AppContext } from "../App";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

type GlobalNavigationState = {
  scroll: number;
  width: string;
};

type GlobalNavigationAction =
  | { type: "scroll"; newScroll: number }
  | { type: "resize"; newWidth: string };

function reducer(
  state: GlobalNavigationState,
  action: GlobalNavigationAction
): GlobalNavigationState {
  switch (action.type) {
    case "resize":
      return { ...state, width: action.newWidth };

    case "scroll":
      return { ...state, scroll: action.newScroll };
  }
}

export function GlobalNavigation(): JSX.Element {
  const {
    state: { globalNavigation },
    execute,
  } = useContext(AppContext);

  const [state, dispatch] = useReducer(reducer, globalNavigation);

  execute("globalNavigation.resizeWidth");

  return (
    <Resizable
      width={state.width}
      onResize={(newWidth) => dispatch({ type: "resize", newWidth })}
    >
      <Scrollable
        scroll={state.scroll}
        onScroll={(newScroll) => dispatch({ type: "scroll", newScroll })}
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
    </Resizable>
  );
}
