import { head, partial } from "lodash";
import React, {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { Section } from "../../../shared/ui/app";
import { KeyCode, parseKeyCode } from "../../../shared/io/keyCode";
import { Store } from "../../store";
import styled from "styled-components";
import { getClosestAttribute } from "../../utils/dom";

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

      void store.dispatch("focus.push", focusable);
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
  section: Section;
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
      (current == null || current !== props.section)
    ) {
      if (props.focusOnRender ?? true) {
        element?.blur();
      }

      props.onBlur?.();
      lastCurrent.current = current;
    } else if (current != null && current === props.section) {
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
        void store.dispatch("focus.pop");
      }
    };

    el?.addEventListener("keydown", blur);
    return () => {
      el?.removeEventListener("keydown", blur);
    };
  });

  return (
    <StyledDiv
      ref={containerRef}
      className={props.className}
      tabIndex={props.tabIndex ?? -1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.section }}
    >
      {props.children}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  &:focus {
    outline: none;
  }
`;

export const getFocusableAttribute = partial(
  getClosestAttribute,
  FOCUSABLE_ATTRIBUTE,
) as (el: HTMLElement) => Section | null;

export function wasInsideFocusable(ev: Event, section: Section): boolean {
  const f = getFocusableAttribute(ev.target as HTMLElement);
  return f != null && f === section;
}
