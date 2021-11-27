import React, { createRef, PropsWithChildren, useEffect, useRef } from "react";

export interface FocusableProps {
  name: string;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const divProps = {
    [FOCUSABLE_ATTRIBUTE]: props.name,
    tabIndex: -1,
  };

  // Tracking current focus is done in App.tsx

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
