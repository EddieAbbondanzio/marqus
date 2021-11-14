import React, { useEffect } from "react";

export const DEFAULT_CURSOR = "auto";

export type CursorIcon =
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

export async function temporaryCursor(cursorIcon: CursorIcon, cb: () => any) {
  const original = document.body.style.cursor;

  await cb();

  document.body.style.cursor = original;
}

export function setCursor(cursor: CursorIcon) {
  document.body.style.cursor = cursor;
}

export function resetCursor() {
  document.body.style.cursor = DEFAULT_CURSOR;
}
