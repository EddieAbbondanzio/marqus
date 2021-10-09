import { createApp } from "vue";
import App from "./app";
import router from "./router";
// import store from "./store";

import "bulma";
import "@fortawesome/fontawesome-free";
import "./assets/styles/main.sass";

createApp(App)
  // .use(store)
  .use(router)
  .mount("#app");
