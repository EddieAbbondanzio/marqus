import { Reducer, RefObject, useCallback, useEffect, useReducer } from "react";
import { UnsupportedError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { Action } from "../types";

export type MouseButton = "left" | "right" | "either";
export type MouseEventType =
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

const reducer: Reducer<MouseDragging, MouseAction> = (dragging, action) => {
  const { type } = action;
  switch (type) {
    case "dragStart":
      console.log("set draggin el ");
      return { element: action.element, hasMoved: undefined };

    case "dragMove":
      return { ...dragging, hasMoved: true };

    case "dragCancel":
    case "dragEnd":
      return { element: undefined, hasMoved: undefined };

    default:
      throw new UnsupportedError(
        `Invalid transition type for state holding recieved: ${type}`
      );
  }
};

export type MouseListenOpts =
  | { event: "click"; button?: MouseButton }
  | { event: Exclude<MouseEventType, "click"> };

export interface Mouse {
  listen(opts: MouseListenOpts, callback: () => void): void;
}

export class MouseController implements Mouse {
  listeners: {
    [ev in MouseEventType]+?: { callback: () => void; button?: MouseButton };
  } = {};

  listen(opts: MouseListenOpts, callback: () => void): void {
    this.listeners[opts.event] = {
      callback,
      button: opts.event === "click" ? opts.button ?? "left" : undefined,
    };
  }

  notify(event: MouseEventType, button?: MouseButton) {
    const listener = this.listeners[event];
    if (listener == null) {
      return;
    }

    switch (event) {
      case "click":
        if (listener.button !== button) {
          return;
        }
      default:
        listener.callback();
        break;
    }
  }
}

export function useMouse<El extends HTMLElement = HTMLElement>(
  element: RefObject<El>
) {
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
      mouse.notify("dragStart");
    }

    dispatch({ type: "dragMove" });
    mouse.notify("dragMove");
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
      mouse.notify("click", button);
    }

    dispatch({ type: "dragEnd" });
    mouse.notify("dragEnd", button);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = parseKeyCode(event.code);
    if (key === KeyCode.Escape) {
      dispatch({ type: "dragCancel" });
      mouse.notify("dragCancel");
    }
  };

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

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
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
