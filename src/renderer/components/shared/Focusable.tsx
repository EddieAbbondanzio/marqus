import { head } from "lodash";
import React, {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import styled from "styled-components";
import { Section } from "../../../shared/domain/ui/sections";
import { KeyCode, parseKeyCode } from "../../../shared/io/keyCode";
import { w100 } from "../../css";
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
  const [current] = props.store.state.ui.focused;
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
        props.store.dispatch("focus.pop");
      }
    };

    el?.addEventListener("keydown", blur);
    return () => {
      el?.removeEventListener("keydown", blur);
    };
  });

  return (
    <Container
      ref={containerRef}
      className={props.className}
      tabIndex={props.tabIndex ?? -1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.name }}
    >
      {props.children}
    </Container>
  );
}

const Container = styled.div`
  ${w100}
`;

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
