import App from "@/App";
import router from "@/router";
import { createApp } from "vue";
import { store } from "@/store";

// Pull in css
import "bulma";
import "@fortawesome/fontawesome-free";
import "@/assets/styles/main.sass";
import { PromptUser } from "./promptUser/types";

// prettier-ignore
const app = createApp(App);

app.directive("test", (el, binding) => {
  console.log("arg: ", binding.arg);
  console.log("value: ", binding.value);
  console.log("modifiers: ", binding.modifiers);
});

app.use(store).use(router).mount("#app");

// Make our contextBridge properties type safe.
declare global {
  interface Window {
    promptUser: PromptUser;
  }
}
