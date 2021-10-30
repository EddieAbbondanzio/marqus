import { debounce } from "lodash";
import React from "react";

export interface ScrollableProps {
  onScroll?: (scrollPos: number) => void;
}

export function Scrollable(props: React.PropsWithChildren<ScrollableProps>) {
  const styles: React.CSSProperties = {
    overflowY: "scroll",
  };

  // Debounce it so we don't spam the event handler.
  const onScroll = debounce(
    (ev: React.UIEvent<HTMLDivElement>) => {
      if (props.onScroll != null) {
        const newPos = (ev.target as HTMLDivElement).scrollTop;
        props.onScroll(newPos);
      }
    },
    100,
    { trailing: true }
  );

  return (
    <div className="h-100" style={styles} onScroll={onScroll}>
      {props.children}
    </div>
  );
}
