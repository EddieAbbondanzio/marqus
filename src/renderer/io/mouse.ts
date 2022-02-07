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

// export type MouseButton = "left" | "right";

export enum MouseButton {
  None = 0,
  Left = 1 << 1,
  Right = 1 << 2,
  Any = ~(~0 << 3),
}

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

export type MouseClickEventOpts = {
  event: "click";
  button?: MouseButton;
  modifier?: MouseModifier;
};
export type MouseEventOpts = { event: Exclude<MouseEventType, "click"> };

export type MouseClickCallback = (ev: MouseEvent, button: MouseButton) => void;
export type MouseCallback = (ev: MouseEvent, button: MouseButton) => void;

export interface Mouse {
  listen(opts: MouseClickEventOpts, callback: MouseClickCallback): void;
  listen(opts: MouseEventOpts, callback: MouseCallback): void;
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

  // Be careful modifying anything below.

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
      callback: MouseClickCallback;
      button?: MouseButton;
      modifier?: MouseModifier;
    };
  } = {};

  listen(
    opts: MouseClickEventOpts | MouseEventOpts,
    callback: MouseClickCallback | MouseClickEventOpts
  ): void {
    if (opts.event === "click") {
      this.listeners[opts.event] = {
        callback: callback as MouseClickCallback,
        button: opts.button ?? MouseButton.Any,
        modifier: opts.modifier ?? MouseModifier.None,
      };
    } else {
      this.listeners[opts.event] = {
        callback: callback as MouseCallback,
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
      if (button == null) {
        throw Error(`Click event requires button`);
      }
      if ((listener.button! & button) == MouseButton.None) {
        // console.log("Button not a match", {
        //   listener: listener.button,
        //   button,
        // });
        return;
      }
      if (listener.modifier !== (modifier ?? MouseModifier.None)) {
        // console.log("Modifier not a match", {
        // listener: listener.modifier,
        // modifier,
        // });
        return;
      }
    }

    listener.callback(event, button!);
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
      button = MouseButton.Left; // "left";
      break;
    case 2:
      button = MouseButton.Right; // "right";
      break;
    default:
      throw new InvalidOpError(`Unknown mouse button ${ev.button}`);
  }

  let modifier: MouseModifier = MouseModifier.None;
  modifier;

  // Don't use if else since 1 or more modifiers can be active
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
