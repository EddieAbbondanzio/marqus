import App from "@/App";
import router from "@/router";
import store from "@/store";
import { createApp } from "vue";

// Pull in css
import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";

createApp(App).use(store).use(router).mount("#app");
