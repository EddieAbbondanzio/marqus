import { RefObject, useEffect, useState } from "react";
import { InvalidOpError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";

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

export async function cursor(
  cursorIcon: Cursor,
  cb: () => Promise<void>
): Promise<void> {
  const original = document.body.style.cursor;
  document.body.style.cursor = cursorIcon;
  await cb();
  document.body.style.cursor = original;
}

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
  ref: RefObject<HTMLElement | Window | null>,
  callback: (drag: MouseDrag | null) => void,
  opts?: { cursor: Cursor }
): void {
  const [drag, setDrag] = useState<MouseDrag | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el == null) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        drag != null &&
        drag.state !== "dragCancelled" &&
        drag.state !== "dragEnded"
      ) {
        throw new InvalidOpError(`Mouse is already dragging. Can't restart.`);
      }

      const newDrag: MouseDrag = {
        state: "dragStarted",
        event,
      };
      setDrag(newDrag);
      if (opts?.cursor) {
        setCursor(opts.cursor);
      }
      callback(newDrag);
    };

    const onMouseMove = (event: MouseEvent) => {
      // Don't track movement when not holding.
      if (
        drag == null ||
        (drag.state != "dragging" && drag.state !== "dragStarted")
      ) {
        return;
      }

      const newDrag: MouseDrag = {
        state: "dragging",
        event,
      };
      setDrag(newDrag);
      callback(newDrag);
    };

    const onMouseUp = (event: MouseEvent) => {
      /*
       * If no element and an onMouseUp event was fired it means
       * the drag was cancelled and should be ignored.
       */
      if (drag == null || drag.state === "dragCancelled") {
        return;
      }

      const newDrag: MouseDrag = {
        state: "dragEnded",
        event,
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
  }, [opts, callback, drag, ref]);
}
