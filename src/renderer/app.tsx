import * as React from "react";
import * as ReactDOM from "react-dom";

function render() {
  const app = document.getElementById("app");

  if (app == null) {
    throw Error("No root container to render in");
  }

  ReactDOM.render(<h2>Hello from React!</h2>, app);
}

render();
