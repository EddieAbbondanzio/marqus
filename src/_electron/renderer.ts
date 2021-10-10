import App from "@/App";
import router from "@/router";
import { createApp } from "vue";
import { store } from "@/store";

// Pull in css
import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";
import { PromptUser } from "./promptUser/common";

// prettier-ignore
createApp(App)
  .use(store)
  .use(router)
  .mount("#app");

// Make our contextBridge properties type safe.
declare global {
  interface Window {
    promptUser: PromptUser;
  }
}
