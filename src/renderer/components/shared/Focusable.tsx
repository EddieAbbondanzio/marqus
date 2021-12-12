import React, { PropsWithChildren } from "react";
import { UISection } from "../../../shared/state";

export interface FocusableProps {
  name: string;
  className?: string;
}

export type IsFocused = (section: UISection) => boolean;

// This component is used to support our shortcuts to move focus between
// different app sections.
export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const divProps = {
    [FOCUSABLE_ATTRIBUTE]: props.name,
    tabIndex: -1,
  };

  return (
    <div className={props.className} {...divProps}>
      {props.children}
    </div>
  );
}

export const FOCUSABLE_ATTRIBUTE = "data-focusable";
