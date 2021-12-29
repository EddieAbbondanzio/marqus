import { clamp, debounce } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";

export interface ScrollableProps {
  scroll?: number;
  onScroll?: (scrollPos: number) => void;
}

export function Scrollable(props: React.PropsWithChildren<ScrollableProps>) {
  const styles: React.CSSProperties = {
    overflowY: "auto",
    overflowX: "visible",
  };

  // Debounce it so we don't spam the event handler.
  const onScroll = useCallback(
    debounce(
      (ev: React.UIEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          const newPos = (ev.target as HTMLDivElement).scrollTop;
          props.onScroll(newPos);
        }
      },
      100,
      { trailing: true }
    ),
    [props.onScroll]
  );

  const wrapper = useRef(null as unknown as HTMLDivElement);

  useEffect(() => {
    const el = wrapper.current;

    if (props.scroll != null && el != null) {
      const clamped = clamp(props.scroll, 0, el.scrollHeight - el.clientHeight);
      wrapper.current.scrollTop = clamped;

      if (props.scroll != clamped) {
        props.onScroll?.(clamped);
      }
    }
  });

  return (
    <div
      className="is-flex is-flex-direction-column is-flex-grow-1"
      style={styles}
      onScroll={onScroll}
      ref={wrapper}
    >
      {props.children}
    </div>
  );
}
