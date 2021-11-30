import React, { PropsWithChildren } from "react";
import { UISection } from "../../../shared/domain";

export interface FocusableProps {
  name: string;
}

export type IsFocused = (section: UISection) => boolean;

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const divProps = {
    [FOCUSABLE_ATTRIBUTE]: props.name,
    tabIndex: -1,
  };

  return (
    <div
      className="is-flex is-flex-grow-1 is-flex-direction-column"
      {...divProps}
    >
      {props.children}
    </div>
  );
}

export const FOCUSABLE_ATTRIBUTE = "data-focusable";
