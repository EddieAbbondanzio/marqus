import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { useReducer } from "react";

type GlobalNavigationState = {
  scroll: number;
  width: string;
};

type GlobalNavigationAction =
  | { type: "scroll"; newScroll: number }
  | { type: "resize"; newWidth: string };

(async () => {
  fontAwesomeLib();

  const dom = document.getElementById("app");

  if (dom == null) {
    throw Error("No root container to render in");
  }

  const state = await AppState.load();
  console.log("Loaded app state: ", state);

  function App() {
    function reducer(
      state: GlobalNavigationState,
      action: GlobalNavigationAction,
    ): GlobalNavigationState {
      switch (action.type) {
        case "resize":
          return { ...state, width: action.newWidth };

        case "scroll":
          return { ...state, scroll: action.newScroll };
      }
    }

    const [s, dispatch] = useReducer(reducer, state.globalNavigation);

    return (
      <Layout>
        <GlobalNavigation
          {...s}
          onResize={newWidth => dispatch({ type: "resize", newWidth })}
          onScroll={newScroll => dispatch({ type: "scroll", newScroll })}
        />
      </Layout>
    );
  }

  ReactDOM.render(<App />, dom);
})();
