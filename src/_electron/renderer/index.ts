import { createApp } from "vue";
// import store from "./store";

import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";
import App from "@/App";
import router from "@/router";

createApp(App)
  // .use(store)
  .use(router)
  .mount("#app");
