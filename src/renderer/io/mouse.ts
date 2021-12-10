import { Reducer, RefObject, useCallback, useEffect, useReducer } from "react";
import { InvalidOpError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { Action } from "../types";

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

export type MouseButton = "left" | "right" | "either";
export type MouseEventType =
  | "mouseOver"
  | "mouseEnter"
  | "mouseLeave"
  | "dragStart"
  | "dragEnd"
  | "dragMove"
  | "dragCancel"
  | "click";

type MouseAction =
  | Action<"dragStart", { element: HTMLElement }>
  | Action<"dragMove">
  | Action<"dragEnd">
  | Action<"dragCancel">;

interface MouseDragging {
  element?: HTMLElement;
  hasMoved?: boolean;
}

export type MouseListenOpts =
  | { event: "click"; button?: MouseButton }
  | { event: Exclude<MouseEventType, "click"> };

export type MouseCallback = (ev: MouseEvent) => void;

export interface Mouse {
  listen(opts: MouseListenOpts, callback: MouseCallback): void;
  cursor(cursor: Cursor, cb: () => Promise<any>): Promise<void>;
  setCursor(cursor: Cursor): void;
  resetCursor(): void;
}

export class MouseController implements Mouse {
  listeners: {
    [ev in MouseEventType]+?: { callback: MouseCallback; button?: MouseButton };
  } = {};

  listen(opts: MouseListenOpts, callback: MouseCallback): void {
    this.listeners[opts.event] = {
      callback,
      button: opts.event === "click" ? opts.button ?? "left" : undefined,
    };
  }

  notify(event: MouseEvent, type: MouseEventType, button?: MouseButton) {
    const listener = this.listeners[type];
    if (listener == null) {
      return;
    }

    switch (type) {
      case "click":
        if (listener.button !== button) {
          return;
        }
      default:
        listener.callback(event);
        break;
    }
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

const reducer: Reducer<MouseDragging, MouseAction> = (dragging, action) => {
  const { type } = action;
  switch (type) {
    case "dragStart":
      return { element: action.element, hasMoved: undefined };

    case "dragMove":
      return { ...dragging, hasMoved: true };

    case "dragCancel":
    case "dragEnd":
      return { element: undefined, hasMoved: undefined };

    // MouseOver, mouseEnter, and mouseLeave are not tracked in state

    default:
      throw new InvalidOpError(`Invalid mouse action ${type}`);
  }
};
export function useMouse<El extends HTMLElement = HTMLElement>(
  element: RefObject<El>
): Mouse {
  const [dragging, dispatch] = useReducer(reducer, {});
  const mouse = new MouseController();

  const onMouseDown = (event: MouseEvent) => {
    if (dragging.element != null) {
      return;
    }

    // Change state to be holding
    dispatch({
      type: "dragStart",
      element: event.target as HTMLElement,
    });
  };

  const onMouseMove = (event: MouseEvent) => {
    // Don't track movement when not holding.
    if (dragging.element == null) {
      return;
    }

    const button = getButton(event);
    if (dragging.hasMoved) {
      /*
       * We don't notify the listeners until after a first move otherwise it
       * can be difficult to distinguish a click from drag start.
       */
      mouse.notify(event, "dragStart");
    }

    dispatch({ type: "dragMove" });
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

    const button = getButton(event);
    /*
     * If a mouse up event fired before we changed the drag phase of the
     * active mouse object the user never tried to move the element so
     * we should consider it a click.
     */
    if (!dragging.hasMoved) {
      mouse.notify(event, "click", button);
    }

    dispatch({ type: "dragEnd" });
    mouse.notify(event, "dragEnd", button);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = parseKeyCode(event.code);
    if (key === KeyCode.Escape) {
      dispatch({ type: "dragCancel" });
      mouse.notify(null!, "dragCancel");
    }
  };

  const onMouseEnter = (event: MouseEvent) => mouse.notify(event, "mouseEnter");
  const onMouseLeave = (event: MouseEvent) => mouse.notify(event, "mouseLeave");
  const onMouseOver = (event: MouseEvent) => mouse.notify(event, "mouseOver");

  // Subscribe to it after render
  useEffect(() => {
    const el = element.current;
    if (el == null) {
      throw Error("No DOM element passed");
    }

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mouseover", onMouseOver);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseover", onMouseOver);
    };
  }, [dragging, element]);

  // Downcast to hide .notify()
  return mouse as Mouse;
}

function getButton({ button, ctrlKey }: MouseEvent): MouseButton {
  switch (button) {
    case 0:
      // Support holding ctrl + click to right click
      return !ctrlKey ? "left" : "right";
    case 2:
      return "right";
    default:
      return "either";
  }
}
