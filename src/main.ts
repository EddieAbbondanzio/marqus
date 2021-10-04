/*eslint-disable*/
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/styles/main.sass";
import { store } from "./store";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "@/plugins/vee-validate";
import { contextMenu } from "@/directives/context-menu";
import { mouse } from "./directives/mouse";
import { context } from "./directives/context";

const app = createApp(App);

app
  .use(store)
  .use(router)
  .mount("#app");

app.directive("mouse", mouse);
app.directive("context", context);
app.directive("context-menu", contextMenu);
