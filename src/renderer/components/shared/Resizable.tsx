import React, { PropsWithChildren, useRef, useState } from "react";
import styled from "styled-components";
import { getPx, isPx, px } from "../../../shared/dom";
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

  mouse.listen({ event: "dragStart" }, () => mouse.setCursor("col-resize"));
  mouse.listen({ event: "dragMove" }, (event: MouseEvent) => {
    const minWidth = props.minWidth ?? px(100);
    const minWidthInt = getPx(minWidth);

    const containerOffsetLeft = wrapper.current.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;

    const width = px(Math.max(minWidthInt, pointerRelativeXpos));
    setWidth(width);
  });
  mouse.listen({ event: "dragEnd" }, () => {
    props.onResize(width);
    mouse.resetCursor();
  });
  mouse.listen({ event: "dragCancel" }, () => {
    // Reset it but don't notify prop onResize.
    setWidth(props.width);
    mouse.resetCursor();
  });

  return (
    <Wrapper
      className={props.className}
      width={width}
      minWidth={props.minWidth}
      ref={wrapper}
    >
      {props.children}
      <Handle ref={handle}>&nbsp;</Handle>
    </Wrapper>
  );
}

const Wrapper = styled.div<Pick<ResizableProps, "width" | "minWidth">>`
  display: flex;
  height: 100%;
  width: ${(props) => props.width};
  min-width: ${(props) => props.minWidth};
`;

const Handle = styled.div`
  cursor: ew-resize;
`;
