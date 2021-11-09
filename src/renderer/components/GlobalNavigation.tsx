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
      <Scrollable scroll={state.scroll}>
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
