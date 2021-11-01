/* eslint-disable no-use-before-define */

import { debounce } from "lodash";
import React, { useEffect } from "react";

/*
 * TODO: Refactor this file. It's a bit sloppy because it was copied and pasted
 * from the original Vue codebase.
 *
 * Be careful messing with it for now.
 */

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
  constructor(
    public action: MouseAction,
    public button: MouseButton,
    public callback: MouseActionFunction
  ) {}

  isMatch(action: MouseAction, button: MouseButton) {
    return (
      this.action === action &&
      (this.button === button || this.button === "either")
    );
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

  constructor(
    element: HTMLElement,
    self: boolean,
    manager: MouseObjectPublisher
  ) {
    this.element = element;
    this.self = self;
    this.subscribers = [];

    this.manager = manager;

    element.addEventListener("mousedown", this.onMouseDown.bind(this));
  }

  dispose() {
    this.element.removeEventListener("mousedown", this.onMouseDown);
  }

  notify(action: MouseAction, button: MouseButton, event: MouseEvent) {
    for (const sub of this.subscribers) {
      if (sub.isMatch(action, button)) {
        sub.callback(event);
      }
    }
  }

  subscribe(
    action: MouseAction,
    button: MouseButton,
    callback: MouseActionFunction
  ) {
    if (
      this.subscribers.some(
        (s) =>
          s.action === action && s.callback === callback && s.button === button
      )
    ) {
      throw new Error("Duplicate subscriber");
    }

    const sub = new MouseObjectSubscriber(action, button, callback);
    this.subscribers.push(sub);
    return sub;
  }

  unsubscribe(subscriber: MouseObjectSubscriber) {
    const index = this.subscribers.findIndex((s) => subscriber);

    if (index === -1) {
      throw Error("Could not find mouse object subscriber");
    }

    this.subscribers.splice(index, 1);
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
      // store.dispatch("ui/cursorDraggingStop");
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

        // store.dispatch("ui/cursorDraggingStart");
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

      // store.dispatch("ui/cursorDraggingStop");
    }

    this.active.holding = false;
    this.active.mouseDown = false;
    this.active.activeButton = undefined;
    this.active = null;
    this.cancelled = false;
  }
}

export const mouseObjectPublisher = new MouseObjectPublisher();

export interface MouseHandler {
  action: MouseAction;
  callback: MouseActionFunction;
  button?: MouseButton;
  self?: boolean;
}

export function useMouse<TElement extends HTMLElement = HTMLElement>(
  element: React.RefObject<TElement>,
  handlers: MouseHandler[]
) {
  // Subscribe to it after render
  useEffect(() => {
    const subscribers: MouseObjectSubscriber[] = [];

    const el = element.current;

    if (el == null) {
      throw Error("No DOM element passed");
    }

    let obj = mouseObjectPublisher.get(el);

    for (const h of handlers) {
      if (obj == null) {
        obj = new MouseObject(el, h.self ?? false, mouseObjectPublisher);
        mouseObjectPublisher.add(obj);
      }

      const sub = obj.subscribe(h.action, h.button ?? "left", h.callback);
      subscribers.push(sub);
    }

    return function cleanUp() {
      for (const sub of subscribers) {
        obj!.unsubscribe(sub);
      }
    };
  });
}
