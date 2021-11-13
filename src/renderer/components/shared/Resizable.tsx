import React, {
  PropsWithChildren,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { getPx, isPx, px } from "../../../shared/dom/units";
import { MouseHandler, useMouse } from "../../mouse/mouse";

export interface ResizableProps {
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

export interface ResizeStart {
  type: "resizeStart";
}

export interface ResizeWidth {
  type: "resizeWidth";
  width: string;
}

export interface ResizeEnd {
  type: "resizeEnd";
}

export type ResizableAction = ResizeStart | ResizeWidth | ResizeEnd;

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

  const drag = useCallback((event: MouseEvent) => {
    const minWidth = props.minWidth ?? px(100);
    const minWidthInt = getPx(minWidth);

    const containerOffsetLeft = wrapper.current.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;

    const width = px(Math.max(minWidthInt, pointerRelativeXpos));
    dispatch({ type: "resizeWidth", width: width });
  }, []);

  const release = useCallback(() => {
    dispatch({ type: "resizeEnd" });
    props.onResize!(state.width);
  }, [state]);

  // Listen for prop change and update width
  useEffect(() => {
    dispatch({ type: "resizeWidth", width: props.width });
  }, [props.width]);

  useMouse(handle, [
    {
      action: "hold",
      callback: () => dispatch({ type: "resizeStart" }),
    },
    {
      action: "drag",
      callback: drag,
    },
    {
      action: "release",
      callback: release,
    },
  ]);

  return (
    <div className="resizable-wrapper" ref={wrapper} style={state}>
      {props.children}
      <div className="resizable-handle" ref={handle}>
        &nbsp;
      </div>
    </div>
  );
}
