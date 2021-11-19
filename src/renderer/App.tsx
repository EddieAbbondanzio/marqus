import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext } from "react";
import { Execute, useCommands } from "./commands/index";
import { useKeyboard } from "./io/keyboard";
import { useFocusables } from "./ui/focusables";
import { State } from "../shared/domain";

const { rpc } = window;

export interface AppContext {
  state: State;
  execute: Execute;
  // TODO: Theme support
}

fontAwesomeLib();

const dom = document.getElementById("app");
if (dom == null) {
  throw Error("No root container to render in");
}

export const AppContext = createContext<AppContext | undefined>(undefined);
export const useAppContext = () => {
  const ctx = React.useContext(AppContext);

  if (ctx == null) {
    throw Error(`useAppContext must be called within the AppContext.Provider`);
  }

  return ctx;
};

(async () => {
  const state = await rpc("state.load");
  const setState = async (s: State) => rpc("state.save", s);

  function App() {
    const execute = useCommands(state, setState);
    const isFocused = useFocusables();
    useKeyboard(execute, isFocused);

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
