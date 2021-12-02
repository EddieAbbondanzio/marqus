import React, { useEffect, useRef, useState } from "react";
import { InvalidOpError } from "../../../shared/errors";
import { KeyCode } from "../../../shared/io/keyCode";
import { isBlank } from "../../../shared/utils/string";
import { useKeyboard } from "../../io/keyboard";

export interface NavigationMenuInputProps {
  value: string;
  onInput: (newValue: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface NavigationMenuInputState {
  wasFocused: boolean;
  wasFinalized: boolean;
}

export function NavigationMenuInput(
  props: NavigationMenuInputProps
): JSX.Element {
  const [state, setState] = useState<NavigationMenuInputState>({
    wasFocused: false,
    wasFinalized: false,
  });

  const ref = useRef(null! as HTMLInputElement);
  const keyboard = useKeyboard(ref);

  useEffect(() => {
    const input = ref.current;

    if (input == null) {
      return;
    }

    if (!state.wasFocused) {
      input.focus();
      setState({ ...state, wasFocused: true });
    }

    const onBlur = () => {
      if (state.wasFinalized) {
        return;
      }

      if (!isBlank(props.value)) props.onConfirm();
      else props.onCancel();

      setState({ ...state, wasFinalized: true });
    };

    input.addEventListener("blur", onBlur);

    return () => {
      input.removeEventListener("blur", onBlur);
    };
  }, [props.value]);

  keyboard.listen(
    { event: "keydown", keys: [KeyCode.Enter, KeyCode.Escape] },
    (_, key) => {
      if (state.wasFinalized) {
        return;
      }

      switch (key) {
        case KeyCode.Enter:
          props.onConfirm();
          break;
        case KeyCode.Escape:
          props.onCancel();
          break;
        default:
          throw new InvalidOpError(`Invalid key of ${key}`);
      }

      setState({ ...state, wasFinalized: true });
    }
  );

  return (
    <input
      ref={ref}
      onInput={(ev) => props.onInput((ev.target as HTMLInputElement).value)}
    ></input>
  );
}
