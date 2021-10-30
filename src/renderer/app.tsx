import * as React from "react";
import * as ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFontAwesome } from "./fontawesome";

function render() {
  useFontAwesome();

  const dom = document.getElementById("app");

  if (dom == null) {
    throw Error("No root container to render in");
  }

  ReactDOM.render(
    <div>
      Hello world!
      <FontAwesomeIcon icon="coffee" />
    </div>,
    dom
  );
}

render();
