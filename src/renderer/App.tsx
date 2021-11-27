import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useEffect, useRef } from "react";
import { Execute, useCommands } from "./commands/index";
import { useKeyboard } from "./io/keyboard";
import { State, UISection } from "../shared/domain";
import { findParent } from "./ui/findParent";
import { FOCUSABLE_ATTRIBUTE } from "./ui/focusable";

const { rpc } = window;

export interface AppContext {
  state: State;
  execute: Execute;
  // TODO: Theme support
}

export type IsFocused = (section: UISection) => boolean;

fontAwesomeLib();

const dom = document.getElementById("app");
if (dom == null) {
  throw Error("No root container to render in");
}

// Context allows us to access root state from any component
export const AppContext = createContext<AppContext | undefined>(undefined);
export const useAppContext = () => {
  const ctx = React.useContext(AppContext);

  if (ctx == null) {
    throw Error(`useAppContext must be called within the AppContext.Provider`);
  }

  return ctx;
};

(async () => {
  // Initialize app state
  let state = await rpc("state.load");
  const setState = async (s: State) => {
    await rpc("state.save", s);
    state = s;
    console.log("state was saved: ", state);
  };

  function App() {
    const execute = useCommands(state, setState);
    useKeyboard(state.shortcuts, execute, (section: UISection) => {
      console.log("Curr state: ", state.ui);
      return state.ui.focused === section;
    });

    function onFocusIn(event: FocusEvent) {
      // We might need to climb up the dom tree to handle nested children of a scope.
      const focused = findParent(
        event.target as HTMLElement,
        (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE),
        {
          matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE),
          defaultValue: undefined,
        }
      );

      const { ui } = state;
      console.log("new focus: ", focused);
      setState({
        ...state,
        ui: { ...ui, focused: focused == null ? undefined : focused },
      });
    }

    useEffect(() => {
      window.addEventListener("focusin", onFocusIn);

      return () => {
        window.removeEventListener("focusin", onFocusIn);
      };
    });

    return (
      <AppContext.Provider
        value={{
          state,
          execute,
        }}
      >
        <Layout>
          <GlobalNavigation />
        </Layout>
      </AppContext.Provider>
    );
  }

  ReactDOM.render(<App />, dom);
})();
