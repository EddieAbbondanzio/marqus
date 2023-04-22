import { pick } from "lodash";
import { MutableRefObject, useEffect } from "react";

export interface Size {
  height: number;
  width: number;
}

export function useResizeObserver(
  elRef: MutableRefObject<HTMLElement | null>,
  callback?: (size: Size) => void,
): void {
  // Mount / Unmount
  useEffect(() => {
    const el = elRef.current;
    if (el == null) {
      return;
    }
    if (callback == null) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      callback(pick(rect, "height", "width"));
    });

    resizeObserver.observe(el);

    return () => {
      if (resizeObserver != null) {
        resizeObserver.disconnect();
      }
    };
  }, [elRef, callback]);
}
