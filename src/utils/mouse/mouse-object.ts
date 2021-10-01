import { MouseObjectPublisher } from "./mouse-object-publisher";

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
