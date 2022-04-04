import { useEffect, useState } from "react";
import { InvalidOpError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { ElementOrWindow, isRef } from "../types";

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

export interface ClickEventOpts {
  button?: MouseButton;
  modifier?: MouseModifier;
}

export type MouseEventOpts = Record<string, never> | ClickEventOpts;

export type MouseCallback = (ev: MouseEvent, button: MouseButton) => void;

export interface Mouse {
  listen<EventType extends MouseEventType>(
    event: EventType,
    callback: MouseCallback
  ): void;
  listen<EventType extends MouseEventType>(
    event: EventType,
    opts: MouseEventOpts,
    callback: MouseCallback
  ): void;
  cursor(cursor: Cursor, cb: () => Promise<void>): Promise<void>;
  setCursor(cursor: Cursor): void;
  resetCursor(): void;
}

// Track mouse dragging state along with clicks. Useful for listening for
// clicks from specific mouse buttons and/or include modifier keys.
export function useMouse(elOrWindow: ElementOrWindow): Mouse {
  const [dragging, setDragging] = useState<MouseDragging>({
    element: undefined,
    hasMoved: false,
  });

  const [listeners, setListeners] = useState<{
    [ev in MouseEventType]+?: {
      callback: MouseCallback;
      button?: MouseButton;
      modifier?: MouseModifier;
    };
  }>({});

  const notify = (
    event: MouseEvent,
    type: MouseEventType,
    button?: MouseButton,
    modifier?: MouseModifier
  ) => {
    const listener = listeners[type];
    if (listener == null) {
      return;
    }

    if (type === "click") {
      if (button == null) {
        throw Error(`Click event requires button`);
      }
      if ((listener.button! & button) == MouseButton.None) {
        return;
      }
      if (
        listener.modifier != null &&
        listener.modifier !== (modifier ?? MouseModifier.None)
      ) {
        return;
      }
    }

    listener.callback(event, button!);
  };

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
      notify(event, "dragStart");
    }

    setDragging((s) => ({
      ...s,
      hasMoved: true,
    }));
    notify(event, "dragMove");
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
      notify(event, "click", button, modifier);
    }

    setDragging({ element: undefined, hasMoved: undefined });
    notify(event, "dragEnd", button);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    const key = parseKeyCode(event.code);
    if (key === KeyCode.Escape) {
      setDragging({ element: undefined, hasMoved: undefined });
      notify(null!, "dragCancel");
    }
  };

  const onMouseEnter = (event: MouseEvent) => notify(event, "mouseEnter");
  const onMouseLeave = (event: MouseEvent) => notify(event, "mouseLeave");
  const onMouseOver = (event: MouseEvent) => notify(event, "mouseOver");

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
  }, [dragging, elOrWindow, listeners, notify]);
  return {
    listen<EventType extends MouseEventType>(
      event: EventType,
      ...params:
        | [callback: MouseCallback]
        | [opts: MouseEventOpts, callback: MouseCallback]
    ): void {
      let opts: MouseEventOpts | undefined;
      let callback: MouseCallback;
      if (params.length === 1) {
        [callback] = params;
      } else {
        [opts, callback] = params;
      }

      // Assign default click opts
      if (event === "click") {
        opts ??= {} as ClickEventOpts;
        (opts as ClickEventOpts).button ??= MouseButton.Any;
        (opts as ClickEventOpts).modifier ??= MouseModifier.None;
      }

      setListeners({
        ...listeners,
        [event]: {
          callback,
          ...opts,
        },
      });
    },
    cursor: async (cursorIcon: Cursor, cb: () => Promise<any>) => {
      const original = document.body.style.cursor;
      document.body.style.cursor = cursorIcon;
      await cb();
      document.body.style.cursor = original;
    },
    setCursor: (cursor: Cursor) => {
      document.body.style.cursor = cursor;
    },
    resetCursor: () => {
      document.body.style.cursor = DEFAULT_CURSOR;
    },
  };
}

export function getDetails(ev: MouseEvent): [MouseButton, MouseModifier] {
  let button: MouseButton;
  switch (ev.button) {
    case 0:
      button = MouseButton.Left;
      break;
    case 2:
      button = MouseButton.Right;
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
