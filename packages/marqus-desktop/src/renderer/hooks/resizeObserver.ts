import { pick } from "lodash";
import { useEffect } from "react";

export interface Size {
  height: number;
  width: number;
}

export function useResizeObserver(
  el: HTMLElement | null,
  onResize?: (size: Size) => void,
): void {
  // Mount / Unmount
  useEffect(() => {
    if (el == null) {
      return;
    }
    if (onResize == null) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      onResize(pick(rect, "height", "width"));
    });

    resizeObserver.observe(el);

    return () => {
      if (resizeObserver != null) {
        resizeObserver.disconnect();
      }
    };
  }, [el, onResize]);
}
