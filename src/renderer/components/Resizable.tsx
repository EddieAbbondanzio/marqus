import React from "react";

export interface ResizableProps {
  width?: number;
  onResize?: (newWidth: number) => void;
}

export function Resizable(props: React.PropsWithChildren<ResizableProps>) {
  return <div>{props.children}</div>;
}
