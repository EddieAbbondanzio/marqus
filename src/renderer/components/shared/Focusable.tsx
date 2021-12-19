import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { UISection } from "../../../shared/state";
import { FocusContext } from "./FocusTracker";

export interface FocusableProps {
  name: UISection;
  className?: string;
  overwrite?: boolean;
}

export function Focusable(props: PropsWithChildren<FocusableProps>) {
  const ctx = useContext(FocusContext);
  const ref = useRef(null! as HTMLDivElement);

  const publish = () => {
    ctx.push(props.name, ref, props.overwrite);
  };

  // We need to register focusables before focus tracker executes
  useLayoutEffect(() => {
    const name = props.name;
    const div = ref.current;

    div.addEventListener("focusin", publish);
    ctx.subscribe(name, () => div.focus());

    return () => {
      div.removeEventListener("focusin", publish);
      ctx.unsubscribe(name);
    };
  }, []);

  return (
    <div ref={ref} className={props.className} tabIndex={-1}>
      {props.children}
    </div>
  );
}
