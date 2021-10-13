import App from "@/App";
import router from "@/router";
import { createApp } from "vue";
import { store } from "@/store";

// Pull in css
import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";
import { PromptUser } from "./promptUser/types";
import { contextMenu } from "@/directives/contextMenu";
import { focusable } from "@/directives/focusable";
import { mouse } from "@/directives/mouse";
import { FileSystem } from "./fileSystem/types";

const app = createApp(App);

app.directive(...contextMenu);
app.directive(...focusable);
app.directive(...mouse);

// prettier-ignore
app
  .use(store)
  .use(router)
  .mount("#app");

// Make our contextBridge properties type safe.
declare global {
  interface Window {
    promptUser: PromptUser;
    fileSystem: FileSystem;
  }
}
