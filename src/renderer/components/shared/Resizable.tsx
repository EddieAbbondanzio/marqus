/* eslint-disable no-case-declarations */
import { stripUnit } from "polished";
import React, { PropsWithChildren, useRef, useState } from "react";
import styled from "styled-components";
import { PX_REGEX } from "../../../shared/domain";
import { useMouseDrag } from "../../io/mouse";

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
  props: PropsWithChildren<ResizableProps>,
): JSX.Element {
  if (props.width != null && !PX_REGEX.test(props.width)) {
    throw Error("Invalid width format. Expected pixels");
  }

  const [width, setWidth] = useState(props.width);
  const handle = useRef(null! as HTMLDivElement);

  useMouseDrag(
    handle,
    drag => {
      if (drag != null) {
        switch (drag.state) {
          case "dragging":
            let newWidth = `${drag.event.clientX}px`;
            if (props.minWidth) {
              const minWidthInt = stripUnit(props.minWidth) as number;
              newWidth = `${Math.max(minWidthInt, drag.event.clientX)}px`;
            }

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
    { cursor: "ew-resize" },
  );

  // Prob not the best solution. Styled Components doesn't work good here
  // because we do a lot of re-renders as the div is dragged to a new width.
  // Explore some alternative options
  const style = {
    minHeight: "100%",
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
