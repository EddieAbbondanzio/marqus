import * as React from "react";
import * as ReactDOM from "react-dom";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";
import { createContext, useEffect, useReducer } from "react";
import { AppState } from "./ui/appState";
import { execute } from "./commands/index";

interface AppContext {
  state: AppState;
  execute: typeof execute;
  // TODO: Theme support
}

fontAwesomeLib();

const state = window.appState.get();

export const AppContext = createContext<AppContext>({
  state,
} as any);

const dom = document.getElementById("app");

if (dom == null) {
  throw Error("No root container to render in");
}

function App() {
  return (
    <AppContext.Provider value={{ state, execute }}>
      <Layout>
        <GlobalNavigation />
      </Layout>
    </AppContext.Provider>
  );
}

ReactDOM.render(<App />, dom);
