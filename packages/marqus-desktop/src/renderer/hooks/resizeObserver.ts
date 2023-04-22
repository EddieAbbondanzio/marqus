import { pick } from "lodash";
import { useEffect } from "react";

export interface Size {
  height: number;
  width: number;
  scrollHeight: number;
  scrollWidth: number;
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

      const size = {
        ...pick(rect, "height", "width"),
        ...pick(el, "scrollHeight", "scrollWidth"),
      };

      onResize(size);
    });

    resizeObserver.observe(el);

    return () => {
      if (resizeObserver != null) {
        resizeObserver.disconnect();
      }
    };
  }, [el, onResize]);
}
