import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";

export interface ScrollableProps {
  scroll?: number;
  onScroll?: (scrollPos: number) => void;
}

export function Scrollable(props: React.PropsWithChildren<ScrollableProps>) {
  const styles: React.CSSProperties = {
    overflowY: "scroll",
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
    if (props.scroll != null && wrapper.current != null) {
      wrapper.current.scrollTop = props.scroll;
    }
  });

  return (
    <div className="h-100" style={styles} onScroll={onScroll} ref={wrapper}>
      {props.children}
    </div>
  );
}
