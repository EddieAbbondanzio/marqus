import { Ref, RefObject, useEffect, useState } from "react";
import { InvalidOpError } from "../../shared/errors";
import { parseKeyCode, KeyCode } from "../../shared/io/keyCode";
import { ElementOrWindow } from "../types";

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
  ref: RefObject<HTMLElement | Window | null>
): [MouseDrag | null, () => void] {
  const [drag, setDrag] = useState<MouseDrag | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (el == null) {
      return;
    }

    console.log("Add listeners");

    const onMouseDown = (event: MouseEvent) => {
      if (
        drag != null &&
        drag.state !== "dragCancelled" &&
        drag.state !== "dragEnded"
      ) {
        throw new InvalidOpError(`Mouse is already dragging. Can't restart.`);
      }

      setDrag({
        state: "dragStarted",
        event,
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      // Don't track movement when not holding.
      if (
        drag == null ||
        (drag.state != "dragging" && drag.state !== "dragStarted")
      ) {
        return;
      }

      setDrag({
        state: "dragging",
        event,
      });
    };

    const onMouseUp = (event: MouseEvent) => {
      /*
       * If no element and an onMouseUp event was fired it means
       * the drag was cancelled and should be ignored.
       */
      if (drag == null || drag.state === "dragCancelled") {
        return;
      }

      setDrag({
        state: "dragEnded",
        event,
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = parseKeyCode(event.code);
      if (key === KeyCode.Escape) {
        setDrag(null);
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
  }, [ref, drag, setDrag]);

  return [drag, () => setDrag(null)];
}
