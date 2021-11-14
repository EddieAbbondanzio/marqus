import { RefObject, useEffect } from "react";

export type MouseActionFunction = (event: globalThis.MouseEvent) => any;
export type MouseAction = "click" | "hold" | "drag" | "dragcancel" | "release";
export type MouseButton = "left" | "right" | "either";

export interface MouseEventHandler {
  action: MouseAction;
  callback: MouseActionFunction;
  button?: MouseButton;
  self?: boolean;
}

export function useMouse<TElement extends HTMLElement = HTMLElement>(
  element: RefObject<TElement>,
  handlers: MouseEventHandler[]
) {
  const onMouseMove = (event: MouseEvent) => {
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
   const onMouseUp = (event: MouseEvent) => {
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


  // Subscribe to it after render
  useEffect(() => {
    const subscribers: any[] = [];
    const el = element.current;

    if (el == null) {
      throw Error("No DOM element passed");
    }

    for(const h of handlers) {

      
      subscribers.push({})
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
        el.removeEventListener("")
      }
    };
  }, [element, handlers]);
}

/**
 * Get the mouse button from it's index.
 * @param index The mouse button's index.
 */
function getButton(index: number): MouseButton {
  switch (index) {
    case 0:
      return "left";
    case 2:
      return "right";
    default:
      return "either";
  }
}
