import { RefObject, useEffect, useRef, useState } from "react";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { getOffsetRelativeTo } from "../utils/dom";

export const DEFAULT_CURSOR = "auto";

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
  Back = 3,
  Forward = 4,
}

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
  | "ns-resize"
  | "nesw-resize"
  | "nwse-resize"
  | "zoom-in"
  | "zoom-out";

export function setCursor(cursor: Cursor): void {
  document.body.style.cursor = cursor;
}

export function resetCursor(): void {
  document.body.style.cursor = DEFAULT_CURSOR;
}

export type MouseDrag =
  | {
      event: MouseEvent;
      state: Exclude<DragState, "dragCancelled">;
      initialOffset: [number, number];
    }
  | {
      state: "dragCancelled";
    };

export type DragState =
  | "dragStarted"
  | "dragging"
  | "dragEnded"
  | "dragCancelled";

export function useMouseDrag(
  ref: RefObject<HTMLElement | null>,
  callback: (drag: MouseDrag | null) => void,
  opts?: { cursor: Cursor; disabled?: boolean },
): void {
  const [drag, setDrag] = useState<MouseDrag | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el == null) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (opts?.disabled || event.button !== MouseButton.Left) {
        return;
      }

      const newDrag: MouseDrag = {
        state: "dragStarted",
        event,
        initialOffset: getOffsetRelativeTo(event, el),
      };
      setDrag(newDrag);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (opts?.disabled || event.button !== MouseButton.Left) {
        return;
      }

      // Don't track the mouse's movement unless a button is currently pressed.
      if (
        drag == null ||
        (drag.state !== "dragging" && drag.state !== "dragStarted")
      ) {
        return;
      }

      if (opts?.cursor) {
        setCursor(opts.cursor);
      }

      // Announce drag started
      callback(drag);

      const newDrag: MouseDrag = {
        state: "dragging",
        event,
        initialOffset: drag.initialOffset,
      };
      setDrag(newDrag);
      callback(newDrag);
    };

    const onMouseUp = (event: MouseEvent) => {
      if (opts?.disabled || event.button !== MouseButton.Left) {
        return;
      }

      // If there's no element when we handle the onMouseUp event it means the
      // drag was cancelled (user pressed esc) and should be ignored.
      if (drag == null || drag.state !== "dragging") {
        if (opts?.cursor) {
          resetCursor();
        }
        setDrag(null);
        return;
      }

      const newDrag: MouseDrag = {
        state: "dragEnded",
        event,
        initialOffset: drag.initialOffset,
      };
      setDrag(newDrag);
      if (opts?.cursor) {
        resetCursor();
      }
      callback(newDrag);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = parseKeyCode(event.code);
      if (key === KeyCode.Escape) {
        setDrag(null);
        if (opts?.cursor) {
          resetCursor();
        }
        callback({
          state: "dragCancelled",
        });
      }
    };

    (el as HTMLElement).addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      (el as HTMLElement).removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [opts, callback, drag, ref]);
}
