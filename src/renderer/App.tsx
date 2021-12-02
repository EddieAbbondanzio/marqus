import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useEffect, useRef, useState } from "react";
import { Execute, useCommands } from "./commands/index";
import { State } from "../shared/state";
import { render } from "react-dom";
import React from "react";
import { useShortcuts } from "./io/shortcuts";
import { useFocus } from "./io/focus";
import { useMouse } from "./io/mouse";
import { useKeyboard } from "./io/keyboard";
import { px } from "../shared/dom/units";

export interface AppContext {
  state: State;
  execute: Execute;
  saveState: SaveState;
  // TODO: Theme support
}

const dom = document.getElementById("app");
if (dom == null) {
  throw Error("No root container to mount");
}

export type SaveState = (s: State) => void;

// Context allows us to access root state from any component
export const AppContext = createContext<AppContext | undefined>(undefined);
export const useAppContext = () => {
  const ctx = React.useContext(AppContext);

  if (ctx == null) {
    throw Error(
      `useAppContext() must be called within the AppContext.Provider`
    );
  }

  return ctx;
};

(async () => {
  fontAwesomeLib();
  const { rpc } = window;
  let initialState = await rpc("state.load");

  function App() {
    let [state, setState] = useState(initialState);

    const saveState: SaveState = (s: State) => {
      setState(s);
      void rpc("state.save", s);
    };

    const execute = useCommands(state, saveState);
    const isFocused = useFocus(state, saveState);
    useShortcuts(state, execute, isFocused);

    return (
      <AppContext.Provider value={{ state, execute, saveState }}>
        <Layout>
          <GlobalNavigation />
        </Layout>
      </AppContext.Provider>
    );
  }

  render(<App />, dom);
})();
