import { RefObject, useEffect, useState } from "react";

/**
 * Focus an element once.
 * @param ref The element to focus on render.
 */
export function useFocus(ref: RefObject<HTMLElement>, onUse: boolean = true) {
  /*
   * This hook is not related to focus tracking.
   * Auto focus wasn't working...
   */
  const [wasFocused, setWasFocused] = useState(false);

  useEffect(() => {
    const { current: el } = ref;

    if (el != null && (!onUse || !wasFocused)) {
      el.focus();
      setWasFocused(true);
    }
  });

  return {
    focus: () => ref.current?.focus,
  };
}
