import React from "react";
import { PropsWithChildren } from "react";
import { classList } from "../../../shared/dom";
import { BulmaSize } from "../../shared";

export interface InputProps {
  className?: string;
  size?: BulmaSize;
  placeholder?: string;
}

export function Input(props: InputProps) {
  const classes = classList("input", props.size, props.className);
  return <input className={classes} placeholder={props.placeholder} />;
}

export interface CheckboxProps {
  className?: string;
  label?: string | JSX.Element;
  size?: BulmaSize;
}

export function Checkbox(props: CheckboxProps) {
  let sizeClass = "is-size-6";

  switch (props.size) {
    case "is-small":
      sizeClass = "is-size-7";
      break;
    case "is-medium":
      sizeClass = "is-size-5";
      break;
    case "is-large":
      sizeClass = "is-size-4";
      break;
  }

  const labelClasses = classList("checkbox", props.className);
  const textClasses = classList("ml-1", "checkbox", sizeClass);

  return (
    <label className={labelClasses}>
      <input type="checkbox" />
      <span className={textClasses}>{props.label}</span>
    </label>
  );
}

export interface FieldProps {
  label?: JSX.Element | string;
  isHorizontal?: boolean;
  isGrouped?: boolean;
  size?: BulmaSize;
  // TODO: Add help text (error + success)
}

export function Field(props: PropsWithChildren<FieldProps>) {
  const divClasses = classList("field", {
    "is-grouped": props.isGrouped,
    "is-horizontal": props.isHorizontal,
  });
  const labelClasses = classList(
    props.isHorizontal ? "field-label" : "label",
    props.size
  );
  const bodyClasses = classList({ "field-body": props.isHorizontal });

  let labelEl: JSX.Element | undefined = undefined;
  const { label } = props;
  if (label != null) {
    if (typeof label === "string") {
      labelEl = <label className={labelClasses}>{label}</label>;
    } else {
      labelEl = label;
    }
  }

  return (
    <div className={divClasses}>
      {labelEl}
      <div className={bodyClasses}>{props.children}</div>
    </div>
  );
}

export function Form(props: PropsWithChildren<{}>) {
  return <form>{props.children}</form>;
}
