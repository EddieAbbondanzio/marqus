import { useEffect, useState } from "react";
import { InvalidOpError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { Action, ElementOrWindow, isRef } from "../types";

export const DEFAULT_CURSOR = "auto";

export type Cursor =
  | "auto"
  | "default"
  | "none"
  | "context-menu"
  | "help"
  | "pointer"
  | "progress"
  | "wait"
  | "cell"
  | "crosshair"
  | "text"
  | "vertical-text"
  | "alias"
  | "copy"
  | "move"
  | "no-drop"
  | "not-allowed"
  | "grab"
  | "grabbing"
  | "all-scroll"
  | "col-resize"
  | "row-resize"
  | "n-resize"
  | "e-resize"
  | "s-resize"
  | "w-resize"
  | "ne-resize"
  | "nw-resize"
  | "se-resize"
  | "sw-resize"
  | "ew-resize"
  | "ns-resie"
  | "nesw-resize"
  | "nwse-resize"
  | "zoom-in"
  | "zoom-out";

export type MouseButton = "left" | "right";
export type MouseEventType =
  | "mouseOver"
  | "mouseEnter"
  | "mouseLeave"
  | "dragStart"
  | "dragEnd"
  | "dragMove"
  | "dragCancel"
  | "click";

export enum MouseModifier {
  None = 0,
  Shift = 1 << 1,
  Control = 1 << 2,
  Alt = 1 << 3,
  Meta = 1 << 4,
  Any = ~(~0 << 5),
}

interface MouseDragging {
  element?: HTMLElement;
  hasMoved?: boolean;
}

export type MouseListenOpts =
  | { event: "click"; button?: MouseButton; modifier?: MouseModifier }
  | { event: Exclude<MouseEventType, "click"> };

export type MouseCallback = (ev: MouseEvent) => void;

export interface Mouse {
  listen(opts: MouseListenOpts, callback: MouseCallback): void;
  cursor(cursor: Cursor, cb: () => Promise<any>): Promise<void>;
  setCursor(cursor: Cursor): void;
  resetCursor(): void;
}

export function useMouse(elOrWindow: ElementOrWindow): Mouse {
  const [dragging, setDragging] = useState<MouseDragging>({
    element: undefined,
    hasMoved: false,
  });
  const [mouse] = useState(new MouseController());

  const onMouseDown = (event: MouseEvent) => {
    if (dragging.element != null) {
      return;
    }

    // Change state to be holding
    setDragging({
      element: event.target as HTMLElement,
    });
  };

  const onMouseMove = (event: MouseEvent) => {
    // Don't track movement when not holding.
    if (dragging.element == null) {
      return;
    }

    if (dragging.hasMoved) {
      /*
       * We don't notify the listeners until after a first move otherwise it
       * can be difficult to distinguish a click from drag start.
       */
      mouse.notify(event, "dragStart");
    }

    setDragging((s) => ({
      ...s,
      hasMoved: true,
    }));
    mouse.notify(event, "dragMove");
  };

  const onMouseUp = (event: MouseEvent) => {
    /*
     * If no element and an onMouseUp event was fired it means
     * the drag was cancelled and should be ignored.
     */
    if (dragging.element == null) {
      return;
    }

    const [button, modifier] = getDetails(event);
    /*
     * If a mouse up event fired before we changed the drag phase of the
     * active mouse object the user never tried to move the element so
     * we should consider it a click.
     */
    if (!dragging.hasMoved) {
      mouse.notify(event, "click", button, modifier);
    }

    setDragging({ element: undefined, hasMoved: undefined });
    mouse.notify(event, "dragEnd", button);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = parseKeyCode(event.code);
    if (key === KeyCode.Escape) {
      setDragging({ element: undefined, hasMoved: undefined });
      mouse.notify(null!, "dragCancel");
    }
  };

  const onMouseEnter = (event: MouseEvent) => mouse.notify(event, "mouseEnter");
  const onMouseLeave = (event: MouseEvent) => mouse.notify(event, "mouseLeave");
  const onMouseOver = (event: MouseEvent) => mouse.notify(event, "mouseOver");

  // Subscribe to it after render
  useEffect(() => {
    const target = isRef(elOrWindow) ? elOrWindow.current : elOrWindow;
    if (target == null) {
      return;
    }

    target.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keyup", onKeyUp);
    target.addEventListener("mouseenter", onMouseEnter);
    target.addEventListener("mouseleave", onMouseLeave);
    target.addEventListener("mouseover", onMouseOver);
    return () => {
      target.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
      target.removeEventListener("mouseenter", onMouseEnter);
      target.removeEventListener("mouseleave", onMouseLeave);
      target.removeEventListener("mouseover", onMouseOver);
    };
  }, [dragging, elOrWindow]);

  // Downcast to hide .notify()
  return mouse as Mouse;
}
export class MouseController implements Mouse {
  listeners: {
    [ev in MouseEventType]+?: {
      callback: MouseCallback;
      button?: MouseButton;
      modifier?: MouseModifier;
    };
  } = {};

  listen(opts: MouseListenOpts, callback: MouseCallback): void {
    if (opts.event === "click") {
      this.listeners[opts.event] = {
        callback,
        button: opts.button ?? "left",
        modifier: opts.modifier,
      };
    } else {
      this.listeners[opts.event] = {
        callback,
      };
    }
  }

  notify(
    event: MouseEvent,
    type: MouseEventType,
    button?: MouseButton,
    modifier?: MouseModifier
  ) {
    const listener = this.listeners[type];
    if (listener == null) {
      return;
    }

    if (type === "click") {
      if (listener.button !== button) {
        return;
      }
      if (listener.modifier != null && listener.modifier !== modifier) {
        return;
      }
    }

    listener.callback(event);
  }

  async cursor(cursorIcon: Cursor, cb: () => Promise<any>) {
    const original = document.body.style.cursor;
    document.body.style.cursor = cursorIcon;

    await cb();

    document.body.style.cursor = original;
  }

  setCursor(cursor: Cursor) {
    document.body.style.cursor = cursor;
  }

  resetCursor() {
    document.body.style.cursor = DEFAULT_CURSOR;
  }
}

export function getDetails(ev: MouseEvent): [MouseButton, MouseModifier] {
  let button: MouseButton;
  switch (ev.button) {
    case 0:
      button = "left";
      break;
    case 2:
      button = "right";
      break;
    default:
      throw new InvalidOpError(`Unknown mouse button ${ev.button}`);
  }

  let modifier: MouseModifier = MouseModifier.None;
  modifier;

  if (ev.shiftKey) {
    modifier |= MouseModifier.Shift;
  }
  if (ev.ctrlKey) {
    modifier |= MouseModifier.Control;
  }
  if (ev.altKey) {
    modifier |= MouseModifier.Alt;
  }
  if (ev.metaKey) {
    modifier |= MouseModifier.Meta;
  }

  return [button, modifier];
}
