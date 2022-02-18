import { head } from "lodash";
import React, { PropsWithChildren, useEffect, useRef } from "react";
import { MouseButton, MouseModifier, useMouse } from "../../io/mouse";
import { Section } from "../../state";
import { Store } from "../../store";

export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export interface FocusableProps {
  store: Store;
  name: Section;
  className?: string;
  overwrite?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const ref = useRef(null! as HTMLDivElement);
  useEffect(() => {
    const curr = head(props.store.state.ui.focused);

    if (curr == null) {
      ref.current.blur();
      props.onBlur?.();
    } else if (curr == props.name) {
      ref.current.focus();
      props.onFocus?.();
    }
  }, [props.store.state.ui.focused, props.onFocus, props.onBlur]);

  useMouse(ref).listen(
    {
      event: "click",
      button: MouseButton.Left,
    },
    () => {
      props.store.dispatch("focus.push", props.name);
    }
  );

  return (
    <div
      ref={ref}
      className={props.className}
      tabIndex={-1}
      {...{ [FOCUSABLE_ATTRIBUTE]: props.name }}
    >
      {props.children}
    </div>
  );
}
