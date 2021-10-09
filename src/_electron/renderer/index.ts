import { createApp } from "vue";
import { IpcRenderer } from "electron";
// import store from "./store";

import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";
import App from "@/App";
import router from "@/router";

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

createApp(App)
  // .use(store)
  .use(router)
  .mount("#app");
