import React, {
  MouseEventHandler,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { classList } from "../../../shared/dom";

export interface DropdownProps {
  active?: boolean;
  trigger: JSX.Element;
}

export function Dropdown(props: PropsWithChildren<DropdownProps>) {
  const [active, setActive] = useState(props.active ?? false);
  const classes = classList("dropdown", { "is-active": active });

  const toggle = (ev: any) => {
    ev.stopPropagation();
    setActive(!active);
  };

  const close = () => {
    setActive(false);
  };

  // Listen for prop changes when an external trigger is being used.
  useEffect(() => {
    window.addEventListener("click", close);
    setActive(props.active ?? false);

    return () => {
      window.removeEventListener("click", close);
    };
  }, [props.active]);

  return (
    <div className={classes}>
      <div className="dropdown-trigger" onClick={toggle}>
        {props.trigger}
      </div>
      <div className="dropdown-menu">
        <div className="dropdown-content">{props.children}</div>
      </div>
    </div>
  );
}
