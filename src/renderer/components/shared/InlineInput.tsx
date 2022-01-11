import { Size } from "electron";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { classList, percentage, px } from "../../../shared/dom";
import { InvalidOpError } from "../../../shared/errors";
import { KeyCode } from "../../../shared/io/keyCode";
import { isBlank } from "../../../shared/string";
import { useFocus } from "../../io/focus";
import { useKeyboard } from "../../io/keyboard";
import { BulmaSize } from "../../shared";

export interface InlineInputProps {
  className?: string;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  schema?: yup.StringSchema;
  size?: BulmaSize;
}

// DEADWEIGHT

export function InlineInput(props: InlineInputProps): JSX.Element {
  const [flags, setFlags] = useState({
    wasFinalized: false,
    wasTouched: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const input = useRef(null! as HTMLInputElement);

  const validate = async () => {
    if (props.schema == null) {
      return true;
    }

    try {
      await props.schema.validate(props.value);
      setErrorMessage("");
      return true;
    } catch (error) {
      setErrorMessage((error as yup.ValidationError).errors[0]);
      return false;
    }
  };

  if (flags.wasTouched) {
    validate();
  }

  const onBlur = async () => {
    if (flags.wasFinalized || errorMessage.length > 0 || !(await validate())) {
      return;
    }

    if (!isBlank(input.current.value)) {
      props.confirm();
    } else {
      props.cancel();
    }

    setFlags({ ...flags, wasFinalized: true });
  };

  const onInput = async (ev: FormEvent<HTMLInputElement>) => {
    if (flags.wasFinalized) {
      return;
    }

    const value = (ev.target as HTMLInputElement).value as string;
    props.onInput(value.trim());
    setFlags({ ...flags, wasTouched: true });
  };

  useFocus(input);

  useEffect(() => {
    const { current: el } = input;
    el.setCustomValidity(errorMessage);

    el.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("blur", onBlur);
    };
  });

  const keyboard = useKeyboard(input);
  keyboard.listen(
    { event: "keydown", keys: [KeyCode.Enter, KeyCode.Escape] },
    async (_, key) => {
      if (flags.wasFinalized) {
        return;
      }

      switch (key) {
        case KeyCode.Enter:
          const isValid = await validate();

          if (!isValid) {
            return;
          }
          props.confirm();
          break;

        case KeyCode.Escape:
          props.cancel();
          break;

        default:
          throw new InvalidOpError(`Invalid key of ${key}`);
      }

      setFlags({ ...flags, wasFinalized: true });
    }
  );

  const classes = classList(
    "input",
    props.size as string | undefined,
    props.className
  );
  return (
    <div className="field" style={{ position: "relative" }}>
      <input
        ref={input}
        className={classes}
        onInput={onInput}
        value={props.value}
      ></input>
      {errorMessage.length > 0 && (
        <p
          className="help is-danger box m-0 p-2"
          style={{ position: "absolute", width: percentage(100) }}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
