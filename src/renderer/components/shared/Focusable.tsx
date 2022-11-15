import { head } from "lodash";
import React, {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { Section } from "../../../shared/ui/app";
import { KeyCode, parseKeyCode } from "../../../shared/io/keyCode";
import { Store } from "../../store";

// Should not be used directly.
export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export const useFocusTracking = (store: Store): void => {
  /*
   * We centralize this for good reason. By only keeping one listener that
   * handles every event we can ensure we don't accidentally push new focusables
   * as the event propagates up due to how events naturally like to bubble.
   */
  const { state } = store;

  const onClick = (ev: MouseEvent) => {
    const focusable = getFocusableAttribute(ev.target as HTMLElement);
    if (focusable != null) {
      const current = head(state.focused);
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
  props: PropsWithChildren<FocusableProps>,
): JSX.Element {
  const { store } = props;
  const { state } = store;
  const containerRef = useRef(null as HTMLDivElement | null);
  const [current] = state.focused;
  const lastCurrent = useRef(null as Section | null);

  useEffect(() => {
    const element = props.elementRef?.current ?? containerRef.current;

    if (
      (lastCurrent.current == null || lastCurrent.current !== current) &&
      (current == null || current !== props.name)
    ) {
      if (props.focusOnRender ?? true) {
        element?.blur();
      }

      props.onBlur?.();
      lastCurrent.current = current;
    } else if (current != null && current === props.name) {
      if (props.focusOnRender ?? true) {
        element?.focus();
      }
      props.onFocus?.();
    }
  }, [current, props]);

  useEffect(() => {
    if (!props.blurOnEsc) {
      return;
    }

    const { current: el } = containerRef;
    const blur = (ev: KeyboardEvent) => {
      if (parseKeyCode(ev.code) === KeyCode.Escape) {
        store.dispatch("focus.pop");
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

export function wasInsideFocusable(ev: Event, section: Section): boolean {
  const f = getFocusableAttribute(ev.target as HTMLElement);
  return f != null && f === section;
}

export function getFocusableAttribute(element: HTMLElement): Section | null {
  const parent = element.closest(`[${FOCUSABLE_ATTRIBUTE}]`);
  if (parent != null) {
    return parent.getAttribute(FOCUSABLE_ATTRIBUTE) as Section | null;
  }

  return null;
}
