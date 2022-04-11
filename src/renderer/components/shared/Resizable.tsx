/* eslint-disable no-case-declarations */
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { getPx, isPx, px } from "../../../shared/dom";
import { resetCursor, setCursor, useMouseDrag } from "../../io/mouse";

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
  const handle = useRef(null! as HTMLDivElement);

  useMouseDrag(
    handle,
    (drag) => {
      if (drag != null) {
        switch (drag.state) {
          case "dragging":
            const minWidth = props.minWidth ?? px(100);
            const minWidthInt = getPx(minWidth);
            const newWidth = px(Math.max(minWidthInt, drag.event.clientX));

            if (newWidth !== width) {
              setWidth(newWidth);
            }
            break;

          case "dragEnded":
            props.onResize(width);
            break;

          case "dragCancelled":
            // Reset it but don't notify prop onResize.
            setWidth(props.width);
            break;
        }
      }
    },
    { cursor: "ew-resize" }
  );

  const style = {
    height: "100%",
    minWidth: props.minWidth,
    display: "flex",
    flex: `0 0 ${width}`,
  };

  return (
    <div className={props.className} style={style}>
      {props.children}
      <Handle ref={handle}>&nbsp;</Handle>
    </div>
  );
}

const Handle = styled.div`
  cursor: ew-resize;
`;
