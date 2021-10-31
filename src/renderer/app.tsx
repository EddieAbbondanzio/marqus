import * as React from "react";
import * as ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fontAwesomeLib } from "./libs/fontAwesome";
import { Resizable } from "./components/shared/Resizable";
import { GlobalNavigation } from "./components/GlobalNavigation";
import { Layout } from "./components/Layout";

// function render() {
fontAwesomeLib();

const dom = document.getElementById("app");

if (dom == null) {
  throw Error("No root container to render in");
}

const onResize = (w: any) => console.log(w);

ReactDOM.render(
  <Layout>
    <GlobalNavigation />
    {/* <Resizable>B</Resizable> */}
    {/* <Resizable>C</Resizable> */}
  </Layout>,
  dom
);
// }

// render();
