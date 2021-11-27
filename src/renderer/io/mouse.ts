import { Reducer, RefObject, useCallback, useEffect, useReducer } from "react";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { Action } from "../types";

export type MouseButton = "left" | "right" | "either";
export type MouseState = "idle" | "holding";

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

export type MouseTransition =
  | Action<"click">
  | Action<"dragStart", { element: HTMLElement }>
  | Action<"dragMove">
  | Action<"dragEnd">
  | Action<"dragCancel">;
export type MouseTransistionType = MouseTransition["type"];

export type MouseCallback = (event: MouseEvent) => any;
export interface MouseListener {
  button: MouseButton;
  transition: MouseTransistionType;
  callback: MouseCallback;
}

export interface MouseActive {
  element: HTMLElement;
  hasMoved?: boolean;
}

export interface Mouse {
  state: MouseState;
  active?: MouseActive;
  listeners: MouseListener[];
}

export function canApplyTransition(
  state: MouseState,
  type: MouseTransistionType
): boolean {
  switch (state) {
    case "idle":
      return type === "dragStart";
    case "holding":
      return (
        type === "click" ||
        type === "dragMove" ||
        type === "dragEnd" ||
        type === "dragCancel"
      );
  }
}

const transition: Reducer<Mouse, MouseTransition> = (mouse, transition) => {
  const { state, active, listeners } = mouse;
  const { type } = transition;

  // Prevent invalid operations
  if (!canApplyTransition(state, type)) {
    return mouse;
  }

  switch (state) {
    case "idle":
      const { element } = transition as any;

      switch (type) {
        case "dragStart":
          return {
            state: "holding",
            active: { element },
            listeners,
          };
      }

    case "holding":
      switch (type) {
        case "click":
          return { state: "idle", listeners };

        case "dragMove":
          return {
            state: "holding",
            active: { element: active!.element, hasMoved: true },
            listeners,
          };

        case "dragCancel":
          return {
            state: "idle",
            listeners,
          };

        case "dragEnd":
          return { state: "idle", active: undefined, listeners };

        default:
          throw Error(
            `Invalid transition type for state holding recieved: ${type}`
          );
      }
  }
};

export interface MouseEventHandler {
  action: MouseTransistionType;
  button?: MouseButton;
  callback: MouseCallback;
}

export function useMouse<El extends HTMLElement = HTMLElement>(
  element: RefObject<El>,
  handlers: MouseEventHandler[]
) {
  // Initialize state
  const [mouse, applyTransition] = useReducer(transition, {
    state: "idle",
    listeners: handlers.map((h) => ({
      // Assume they want left click if no button passed.
      button: h.button ?? "left",
      callback: h.callback,
      transition: h.action,
    })),
  });

  const onMouseDown = (event: MouseEvent) => {
    const { target } = event;

    if (mouse.state === "holding") {
      console.error(
        "Error: onMouseDown() fired when mouse state was already holding"
      );
      return;
    }

    // Change state to be holding
    applyTransition({
      type: "dragStart",
      element: target as HTMLElement,
    });
  };

  const onMouseMove = (event: MouseEvent) => {
    // Don't track movement when not holding.
    if (mouse.state === "idle" || mouse.active == null) {
      return;
    }

    const button = getButton(event);

    if (!mouse.active.hasMoved) {
      /*
       * We don't notify the listeners until after a first move otherwise it
       * can be difficult to distinguish a click from drag start.
       */
      notifyListeners(mouse.listeners, {
        button,
        event,
        transition: "dragStart",
      });
    }

    applyTransition({ type: "dragMove" });
    notifyListeners(mouse.listeners, {
      button,
      event,
      transition: "dragMove",
    });
  };

  const onMouseUp = (event: MouseEvent) => {
    /*
     * If the mouse state is idle and an onMouseUp event was fired it means
     * the drag was cancelled and should be ignored.
     */
    if (mouse.state === "idle") {
      return;
    }

    if (mouse.active == null) {
      return;
    }

    const button = getButton(event);
    const { hasMoved } = mouse.active;

    if (!hasMoved) {
      /*
       * If a mouse up event fired before we changed the drag phase of the
       * active mouse object the user never tried to move the element so
       * we should consider it a click.
       */
      applyTransition({ type: "click" });
      notifyListeners(mouse.listeners, {
        button,
        event,
        transition: "click",
      });
    } else {
      applyTransition({ type: "dragEnd" });
      notifyListeners(mouse.listeners, {
        button,
        event,
        transition: "dragEnd",
      });
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = parseKeyCode(event.code);

    /*
     * Allow user to cancel dragging if escape key was pressed.
     */
    if (key === KeyCode.Escape) {
      applyTransition({ type: "dragCancel" });
      notifyListeners(mouse.listeners, {
        transition: "dragCancel",
        event,
      });
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
  }, [element, mouse]);
}

export function notifyListeners(
  listeners: MouseListener[],

  context:
    | {
        button: MouseButton;
        transition: "click" | "dragStart" | "dragMove" | "dragEnd";
        event: MouseEvent;
      }
    | {
        transition: "dragCancel";
        event: KeyboardEvent;
      }
) {
  for (const l of listeners) {
    const { transition, button = "left " } = l;

    // HERE BE DRAGONS

    if (transition === "dragCancel" && context.transition === "dragCancel") {
      l.callback(context.event as any);
      continue;
    }

    if (
      transition === context.transition &&
      (button === (context as any).button || button === "either")
    ) {
      l.callback(context.event as any);
    }
  }
}
