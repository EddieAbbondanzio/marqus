/* eslint-disable no-use-before-define */
import { store } from "@/store";
import { DirectiveBinding } from "vue";

export function getDirectiveAction(arg?: string): MouseAction {
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
export function getDirectiveButton(modifiers: { [key: string]: boolean }) {
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
export function getDirectiveCallback(value: any): MouseActionFunction {
  if (typeof value !== "function") {
    throw new Error("Callback must be a function: () => any");
  }

  return value;
}

export type MouseActionFunction = (event: globalThis.MouseEvent) => any;

export type MouseAction = "click" | "hold" | "drag" | "dragcancel" | "release";

export type MouseButton = "left" | "right" | "either";

export function getButton(index: number): MouseButton {
  if (index === 0) {
    return "left";
  } else if (index === 2) {
    return "right";
  } else {
    return "either";
  }
}

export class MouseObjectSubscriber {
  // eslint-disable-next-line no-useless-constructor
  constructor(public action: MouseAction, public button: MouseButton, public callback: MouseActionFunction) {}

  isMatch(action: MouseAction, button: MouseButton) {
    return this.action === action && (this.button === button || this.button === "either");
  }
}

export class MouseObject {
  get subscriberCount() {
    return this.subscribers.length;
  }

    element: HTMLElement;
    manager: MouseObjectPublisher;
    mouseDown = false;
    holding = false;
    moved = false;
    self = false;
    activeButton: MouseButton | undefined;

    subscribers: MouseObjectSubscriber[];

    constructor(element: HTMLElement, self: boolean, manager: MouseObjectPublisher) {
      this.element = element;
      this.self = self;
      this.subscribers = [];

      (this.element as any).mouseObject = this;
      this.manager = manager;

      element.addEventListener("mousedown", this.onMouseDown.bind(this));
    }

    dispose() {
      this.element.removeEventListener("mousedown", this.onMouseDown);
    }

    notify(action: MouseAction, button: MouseButton, event: MouseEvent) {
      for (let i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i].isMatch(action, button)) {
          this.subscribers[i].callback(event);
        }
      }
    }

    subscribe(action: MouseAction, button: MouseButton, callback: MouseActionFunction) {
      if (this.subscribers.some((s) => s.action === action && s.callback === callback && s.button === button)) {
        throw new Error("Duplicate subscriber");
      }

      this.subscribers.push(new MouseObjectSubscriber(action, button, callback));
    }

    unsubscribe(action: MouseAction, button: MouseButton, callback: MouseActionFunction) {
      const keep = [];

      for (let i = 0; i < this.subscribers.length; i++) {
        const sub = this.subscribers[i];

        if (sub.isMatch(action, button) && sub.callback === callback) {
          continue;
        } else {
          keep.push(sub);
        }
      }

      this.subscribers = keep;
    }

    /**
     * Mouse button was pressed event handler.
     * @param this HTMLElement event is on.
     * @param event MouseEvent details
     */
    onMouseDown(event: globalThis.MouseEvent) {
      // Check to see if we should care about it
      const button = getButton(event.button);

      if (this.subscribers.some((s) => s.button === button)) {
        event.stopImmediatePropagation();

        this.mouseDown = true;
        this.manager.active = this;
        this.activeButton = button;
      }
    }
}

export class MouseObjectPublisher {
  objects: MouseObject[];
  active: MouseObject | null = null;

  onMouseMoveListener: (e: MouseEvent) => any;
  onClickListener: (e: MouseEvent) => any;
  onKeyUpListener: (e: KeyboardEvent) => any;

  cancelled = false;

  constructor() {
    this.objects = [];

    this.onMouseMoveListener = this.onMouseMove.bind(this);
    this.onClickListener = this.onMouseUp.bind(this);
    this.onKeyUpListener = this.onKeyUp.bind(this);

    /**
       * Click event is used instead of mouseup because then we can stop
       * events from bubbling up from children if desired.
       */
    window.addEventListener("click", this.onClickListener);
    window.addEventListener("mousemove", this.onMouseMoveListener);
    window.addEventListener("keyup", this.onKeyUpListener);
  }

  dispose() {
    window.removeEventListener("click", this.onClickListener);
    window.removeEventListener("mousemove", this.onMouseMoveListener);
    window.removeEventListener("keyup", this.onKeyUpListener);
  }

  add(obj: MouseObject) {
    this.objects.push(obj);
  }

  get(el: HTMLElement) {
    return this.objects.find((o) => o.element === el);
  }

  remove(obj: MouseObject) {
    this.objects = this.objects.filter((o) => o !== obj);
    obj.dispose();
  }

  onKeyUp(event: KeyboardEvent) {
    if (this.active == null || !this.active.holding) {
      return;
    }

    if (event.key === "Escape") {
      this.cancelled = true;

      this.active.notify("dragcancel", this.active.activeButton!, null!);
      store.dispatch("ui/cursorDraggingStop");
    }
  }

  /**
   * Mouse is dragging an element.
   * @param event MouseEvent details
   */
  onMouseMove(event: MouseEvent) {
    if (this.active == null) {
      return;
    }

    // Don't trigger event if self option is set, and trigger element was different.
    if (this.active.self && this.active.element !== event.target) {
      return;
    }

    event.stopImmediatePropagation();

    // If mouse is down, and moved assume drag
    if (this.active.mouseDown) {
      const button = getButton(event.button);

      if (!this.active.holding) {
        this.active.holding = true;
        this.active.notify("hold", button, event);

        store.dispatch("ui/cursorDraggingStart");
      }

      this.active.notify("drag", button, event);
    }
  }

  /**
   * Mouse button was released event handler.
   * @param event MouseEvent details
   */
  onMouseUp(event: MouseEvent) {
    if (this.active == null) {
      return;
    }

    // Don't trigger event if self option is set, and trigger element was different.
    if (this.active.self && this.active.element !== event.target) {
      return;
    }

    event.stopImmediatePropagation();
    const button = getButton(event.button);

    if (!this.active.holding) {
      this.active.notify("click", button, event);
    } else {
      if (!this.cancelled) {
        this.active.notify("release", button, event);
      }

      store.dispatch("ui/cursorDraggingStop");
    }

    this.active.holding = false;
    this.active.mouseDown = false;
    this.active.activeButton = undefined;
    this.active = null;
    this.cancelled = false;
  }
}

export const mouseObjectPublisher = new MouseObjectPublisher();

/**
 * Directive to abstract basic mouse events into a click, hold, or release event.
 * Expects a value of {click: () => any, hold: () => any, release: () => any}.
 */
export const mouse = {
  beforeMount: function (el: any, binding: DirectiveBinding) {
    const action = getDirectiveAction(binding.arg);
    const callback = getDirectiveCallback(binding.value);
    const button = getDirectiveButton(binding.modifiers);
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

    const action = getDirectiveAction(binding.arg);
    const callback = getDirectiveCallback(binding.value);
    const button = getDirectiveButton(binding.modifiers);

    obj.unsubscribe(action, button, callback);

    if (obj.subscriberCount === 0) {
      mouseObjectPublisher.remove(obj);
    }
  }
};
