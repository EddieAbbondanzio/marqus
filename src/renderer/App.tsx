import { fontAwesomeLib } from "./libs/fontAwesome";
import { Layout } from "./components/Layout";
import { render } from "react-dom";
import React, { Reducer, useReducer } from "react";
import { Action, Command, useCommands } from "./io/commands";
import { sleep } from "../shared/utils/sleep";

type AppState = {
  foo: number;
  bar: string;
};

type AppActions = Action<"foo"> | Action<"bar">;

const reducer: Reducer<AppState, AppActions> = (state, action) => {
  switch (action.type) {
    case "foo":
      return { ...state, foo: state.foo + 1 };
    case "bar":
      return { ...state, bar: state.bar + "A" };
  }
};

const foo: Command<number> = async (ctx) => {
  console.log("1st", ctx.getState());
  ctx.dispatch({ type: "foo" });
  await sleep(3000);
  console.log("2nd", ctx.getState());
  ctx.dispatch({ type: "foo" });
  await sleep(3000);
  console.log("3rd", ctx.getState());
};

const reg = {
  foo,
};

(async () => {
  fontAwesomeLib();

  function App() {
    const onClick = async () => {
      console.log("execute!");
      await execute("foo");
      console.log("complete");
    };

    const [state, execute] = useCommands(reducer, reg, {
      foo: 0,
      bar: "a",
    });

    return (
      <Layout>
        <button className="button" onClick={onClick}>
          Click me!
        </button>
      </Layout>
    );
  }

  render(<App />, document.getElementById("app"));
})();
