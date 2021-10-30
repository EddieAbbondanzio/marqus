import React, { useRef } from "react";
import { MouseButton, MouseHandler, useMouse } from "../../hooks/mouse";

export interface ResizableProps {
  width?: number;
  onResize?: (newWidth: number) => void;
}

export function Resizable(props: React.PropsWithChildren<ResizableProps>) {
  const r = useRef(null as unknown as HTMLDivElement);

  useMouse(r, [
    {
      action: "click",
      button: "left",
      callback: (ev: any) => {
        console.log("CLICK!");
      },
    },
  ]);

  return (
    <div className="m-h-100" ref={r}>
      {props.children}
    </div>
  );
}
