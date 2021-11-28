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
import { FOCUSABLE_ATTRIBUTE, useFocus } from "./components/shared/Focusable";

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
    console.log("new state: ", state);
  };

  function App() {
    const execute = useCommands(() => state, setState);
    useKeyboard(
      state.shortcuts,
      execute,
      (section: UISection) => state.ui.focused === section
    );
    useFocus(state, setState);

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
