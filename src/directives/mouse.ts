import { MouseObjectPublisher } from "@/utils/mouse";
import { MouseObject, MouseAction, MouseActionFunction } from "@/utils/mouse/mouse-object";
import { DirectiveBinding } from "vue";

export const mouseObjectPublisher = new MouseObjectPublisher();

/**
 * Directive to abstract basic mouse events into a click, hold, or release event.
 * Expects a value of {click: () => any, hold: () => any, release: () => any}.
 */
export const mouse = {
  beforeMount: function (el: any, binding: DirectiveBinding) {
    const action = getAction(binding.arg);
    const callback = getCallback(binding.value);
    const button = getButton(binding.modifiers);
    const self = binding.modifiers.self;

    let obj = mouseObjectPublisher.get(el);

    if (obj == null) {
      obj = new MouseObject(el, self, mouseObjectPublisher);
      mouseObjectPublisher.add(obj);
    }

    obj.subscribe(action, button, callback);
    el.mouseObject = obj;
  },

  unmounted: function (el: HTMLElement, binding: DirectiveBinding) {
    const obj = mouseObjectPublisher.get(el);

    if (obj == null) {
      return;
    }

    const action = getAction(binding.arg);
    const callback = getCallback(binding.value);
    const button = getButton(binding.modifiers);

    obj.unsubscribe(action, button, callback);

    if (obj.subscriberCount === 0) {
      mouseObjectPublisher.remove(obj);
    }
  }
};

export function getAction(arg?: string): MouseAction {
  if (
    arg !== "click" &&
    arg !== "hold" &&
    arg !== "release" &&
    arg !== "drag" &&
    arg !== "dragcancel"
  ) {
    throw new Error("Action must be click, hold, drag, or release.");
  }

  return arg;
}

/**
 * Get the button to listen for. Default to either
 * @param modifiers Directive modifiers
 */
export function getButton(modifiers: { [key: string]: boolean }) {
  if (modifiers.left) {
    return "left";
  } else if (modifiers.right) {
    return "right";
  } else {
    return "either";
  }
}

/**
 * Get the callback to notify of the event.
 * @param value Directive value
 */
export function getCallback(value: any): MouseActionFunction {
  if (typeof value !== "function") {
    throw new Error("Callback must be a function: () => any");
  }

  return value;
}
