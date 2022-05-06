import { head } from "lodash";
import React, {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { Section } from "../../../shared/domain/ui";
import { KeyCode, parseKeyCode } from "../../../shared/io/keyCode";
import { Store } from "../../store";
import { findParent } from "../../utils/findParent";

// Should not be used directly.
export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export const useFocusTracking = (store: Store): void => {
  /*
   * We centralize this for good reason. By only keeping one listener that
   * handles every event we can ensure we don't accidentally push new focusables
   * as the event propagates up due to how events naturally like to bubble.
   */
  const onClick = (ev: MouseEvent) => {
    const focusable = getFocusableAttribute(ev.target as HTMLElement);

    if (focusable != null) {
      const current = head(store.state.ui.focused);
      if (current != null && focusable === current) {
        return;
      }

      store.dispatch("focus.push", focusable);
    }
  };

  useEffect(() => {
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  });
};
export interface FocusableProps {
  store: Store;
  name: Section;
  className?: string;
  elementRef?: MutableRefObject<HTMLElement | null>;
  focusOnRender?: boolean;
  tabIndex?: number;
  blurOnEsc?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function Focusable(
  props: PropsWithChildren<FocusableProps>
): JSX.Element {
  const containerRef = useRef(null as HTMLDivElement | null);
  useEffect(() => {
    const element = props.elementRef?.current ?? containerRef.current;
    const [current] = props.store.state.ui.focused;

    if (current == null || current !== props.name) {
      if (props.focusOnRender !== false) {
        element?.blur();
      }

      props.onBlur?.();
    } else if (current === props.name) {
      if (props.focusOnRender !== false) {
        element?.focus();
      }
      props.onFocus?.();
    }
  });

  useEffect(() => {
    if (!props.blurOnEsc) {
      return;
    }

    const { current: el } = containerRef;
    const blur = (ev: KeyboardEvent) => {
      if (parseKeyCode(ev.code) === KeyCode.Escape) {
        props.store.dispatch("focus.pop");
      }
    };

    el?.addEventListener("keydown", blur);
    return () => {
      el?.removeEventListener("keydown", blur);
    };
  });

  return (
    <div
      ref={containerRef}
      className={props.className}
      tabIndex={props.tabIndex ?? -1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.name }}
    >
      {props.children}
    </div>
  );
}

export function wasInsideFocusable(ev: Event, focusable: Section): boolean {
  return findParent(
    ev.target as HTMLElement,
    (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) === focusable
  );
}

export function getFocusableAttribute(element: HTMLElement): Section | null {
  return findParent(element, (el) => el.hasAttribute(FOCUSABLE_ATTRIBUTE), {
    matchValue: (el) => el.getAttribute(FOCUSABLE_ATTRIBUTE) as Section | null,
  });
}
