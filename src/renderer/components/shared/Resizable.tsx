import React, {
  PropsWithChildren,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { getPx, isPx, px } from "../../../shared/dom";
import { useMouse } from "../../io/mouse";
import { Action } from "../../types";

export interface ResizableProps {
  className?: string;
  minWidth?: string;
  width: string;
  /**
   * Callback that is notified of a width change only after the
   * change is completed.
   */
  onResize: (newWidth: string) => void;
}

export interface ResizableState {
  width: string;
  isResizing?: boolean;
}

export type ResizableAction =
  | Action<"resizeStart">
  | Action<"resizeWidth", { width: string }>
  | Action<"resizeEnd">;

const reducer: Reducer<ResizableState, ResizableAction> = (state, action) => {
  switch (action.type) {
    case "resizeStart":
      return { ...state, isResizing: true };

    case "resizeEnd":
      return { ...state, isResizing: undefined };

    case "resizeWidth":
      return { ...state, width: action.width };
  }
};

export function Resizable(
  props: PropsWithChildren<ResizableProps>
): JSX.Element {
  if (props.width != null && !isPx(props.width)) {
    throw Error("Invalid width format. Expected pixels");
  }

  const wrapper = useRef(null as unknown as HTMLDivElement);
  const handle = useRef(null as unknown as HTMLDivElement);

  const [state, dispatch] = useReducer(reducer, {
    width: props.width,
  });

  const mouse = useMouse(handle);

  let widthRef = useRef(state.width);

  const hold = useCallback(() => {
    dispatch({ type: "resizeStart" });
    mouse.setCursor("col-resize");
  }, [dispatch]);

  const drag = useCallback(
    (event: MouseEvent) => {
      const minWidth = props.minWidth ?? px(100);
      const minWidthInt = getPx(minWidth);

      const containerOffsetLeft = wrapper.current.offsetLeft;
      const pointerRelativeXpos = event.clientX - containerOffsetLeft;

      const width = px(Math.max(minWidthInt, pointerRelativeXpos));
      dispatch({ type: "resizeWidth", width: width });
      widthRef.current = width;
    },
    [state, props]
  );

  const release = useCallback(() => {
    dispatch({ type: "resizeEnd" });
    props.onResize!(widthRef.current);

    mouse.resetCursor();
  }, [state.width]);

  // Listen for prop change and update width
  useEffect(() => {
    dispatch({ type: "resizeWidth", width: props.width });
  }, [dispatch, props.width]);

  mouse.listen({ event: "dragStart" }, hold);
  mouse.listen({ event: "dragMove" }, drag);
  mouse.listen({ event: "dragEnd" }, release);
  mouse.listen({ event: "dragCancel" }, () => {
    // Reset it but don't notify prop onResize.
    dispatch({ type: "resizeWidth", width: props.width });
    dispatch({ type: "resizeEnd" });
  });

  return (
    <Wrapper
      className={props.className}
      width={state.width}
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
  cursor: pointer;
`;
