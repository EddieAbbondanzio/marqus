import * as React from "react";
import * as ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { Resizable } from "./components/shared/Resizable";
import {
  GlobalNavigation,
  GlobalNavigationProps,
} from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { useTags } from "./hooks/tags";
import { px } from "./dom/units";
import { useReducer } from "react";

fontAwesomeLib();

const dom = document.getElementById("app");

if (dom == null) {
  throw Error("No root container to render in");
}

function App() {
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

  const [state, dispatch] = useReducer(reducer, globalNavigation);

  return (
    <Layout>
      <GlobalNavigation
        {...state}
        onResize={(newWidth) => dispatch({ type: "resize", newWidth })}
        onScroll={(newScroll) => dispatch({ type: "scroll", newScroll })}
      />
    </Layout>
  );
}

let globalNavigation: GlobalNavigationState = {
  scroll: 400,
  width: px(300),
};

type GlobalNavigationState = {
  scroll: number;
  width: string;
};

type GlobalNavigationAction =
  | { type: "scroll"; newScroll: number }
  | { type: "resize"; newWidth: string };

ReactDOM.render(<App />, dom);
