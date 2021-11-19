import React, { useEffect, useRef, useState } from "react";
import { PropsWithChildren } from "react";
import { generateId } from "../../../shared/domain";
import {
  FOCUSABLE_ID_ATTRIBUTE,
  registerFocusable,
  removeFocusable,
} from "../../ui/focusables";

export interface FocusableProps {
  name?: string;
}

export function Focusable({ children }: PropsWithChildren<FocusableProps>) {
  const [id] = useState(generateId);
  const el = useRef<HTMLDivElement>(null);

  const customAttributes = {
    [FOCUSABLE_ID_ATTRIBUTE]: id,
  };

  useEffect(() => {
    const f = {
      id,
      el: el.current!,
      name: "globalNavigation",
    };

    registerFocusable(f);

    return () => {
      removeFocusable(f);
    };
  });

  return (
    <div tabIndex={-1} ref={el} {...customAttributes}>
      {children}
    </div>
  );
}
