import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useState } from "react";
import { Execute, useCommands } from "./commands/index";
import { useKeyboard } from "./io/keyboard";
import { State, UISection } from "../shared/domain";
import { useFocus } from "./components/shared/Focusable";
import { render } from "react-dom";
import React from "react";

export interface AppContext {
  state: State;
  execute: Execute;
  // TODO: Theme support
}

const dom = document.getElementById("app");
if (dom == null) {
  throw Error("No root container to mount");
}

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

    const saveToFile = (s: State) => {
      setState(s);
      void rpc("state.save", s);
    };

    const execute = useCommands(state, saveToFile);
    const isFocused = useFocus(state, saveToFile);
    useKeyboard(state.shortcuts, execute, isFocused);

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

  render(<App />, dom);
})();
