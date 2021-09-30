import { shortcuts } from "@/utils/shortcuts/shortcuts";
import { DirectiveBinding } from "vue";

export const shortcut = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  beforeMount: function (el: HTMLElement, binding: DirectiveBinding) {
    // const shortcutName = binding.arg;

    // if (shortcutName == null) {
    //   throw Error("No shortcut name specified.");
    // }

    // const callback: ShortcutCallback = binding.value;

    // if (callback == null) {
    //   throw Error("No callback for the shortcut specified.");
    // }

    // // Is it a context based shortcut?
    // let when: (() => boolean) | undefined;

    // if (!binding.modifiers.global) {
    //   when = () => inputScopes.isElementActive(el);
    // }

    // shortcuts.subscribe(shortcutName, callback, { el, when });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unmounted: function (el: HTMLElement, binding: DirectiveBinding) {
    // const subscribers = shortcuts.getSubscribersByElement(el);
    // const subscriber = subscribers.find(s => s.shortcutName === binding.arg);

    // if (subscriber == null) {
    //   throw Error("No subscriber to remove");
    // }

    // shortcuts.unsubscribe(subscriber);
  }
};
