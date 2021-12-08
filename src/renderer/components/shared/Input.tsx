import React, { FormEvent, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { classList } from "../../../shared/dom";

export interface InputProps {
  value: string;
  onInput: (ev: FormEvent<HTMLInputElement>) => void;
  schema?: yup.StringSchema;
  size?: "is-small" | "is-medium" | "is-large";
}

export function Input(props: InputProps): JSX.Element {
  const [errorMessage, setErrorMessage] = useState("");

  const input = useRef(null! as HTMLInputElement);
  input.current?.setCustomValidity(errorMessage);

  const onInput = async (ev: FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value as string;
    // Must be called before first await
    props.onInput(ev);

    if (props.schema != null) {
      setErrorMessage("");

      try {
        await props.schema.validate(value);
      } catch (error) {
        setErrorMessage((error as yup.ValidationError).errors[0]);
      }
    }
  };

  const classes = classList("input", props.size);
  return (
    <div className="field">
      <input
        ref={input}
        className={classes}
        value={props.value}
        onInput={onInput}
      ></input>
      {errorMessage.length > 0 && (
        <p className="help is-danger">{errorMessage}</p>
      )}
    </div>
  );
}
