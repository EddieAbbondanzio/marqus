import React, { PropsWithChildren, useRef, useState } from "react";
import styled from "styled-components";
import { getPx, isPx, px } from "../../utils/dom";
import { useMouse } from "../../io/mouse";

export interface ResizableProps {
  className?: string;
  minWidth?: string;
  width: string;
  // Callback is notified of a width change once resize completes
  onResize: (newWidth: string) => void;
}

export interface ResizableState {
  width: string;
  isResizing?: boolean;
}

export function Resizable(
  props: PropsWithChildren<ResizableProps>
): JSX.Element {
  if (props.width != null && !isPx(props.width)) {
    throw Error("Invalid width format. Expected pixels");
  }

  const [width, setWidth] = useState(props.width);
  const wrapper = useRef(null! as HTMLDivElement);
  const handle = useRef(null! as HTMLDivElement);
  const mouse = useMouse(handle);

  mouse.listen("dragStart", () => mouse.setCursor("col-resize"));
  mouse.listen("dragMove", (event: MouseEvent) => {
    const minWidth = props.minWidth ?? px(100);
    const minWidthInt = getPx(minWidth);

    const newWidth = px(Math.max(minWidthInt, event.clientX));
    setWidth(newWidth);
  });
  mouse.listen("dragEnd", () => {
    props.onResize(width);
    mouse.resetCursor();
  });
  mouse.listen("dragCancel", () => {
    // Reset it but don't notify prop onResize.
    setWidth(props.width);
    mouse.resetCursor();
  });

  const style = {
    height: "100%",
    minWidth: props.minWidth,
    display: "flex",
    flex: `0 0 ${width}`,
    flexGrow: 1,
  };

  return (
    <div className={props.className} ref={wrapper} style={style}>
      {props.children}
      <Handle ref={handle}>&nbsp;</Handle>
    </div>
  );
}

const Handle = styled.div`
  cursor: ew-resize;
`;
