import { clamp, debounce } from "lodash";
import OpenColor from "open-color";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { mh100, w100 } from "../../css";

const SCROLL_DEBOUNCE_INTERVAL = 100; // ms

export interface ScrollableProps {
  className?: string;
  height?: string;
  scroll?: number;
  orientation?: ScrollOrientation;
  onScroll?: (scrollPos: number) => void;
}
export type ScrollOrientation = "horizontal" | "vertical";

export function Scrollable(props: React.PropsWithChildren<ScrollableProps>) {
  const {
    scroll,
    className,
    height = "100%",
    orientation = "vertical",
  } = props;

  // Debounce it so we don't spam the event handler.
  const onScroll = useCallback(
    debounce(
      (ev: React.UIEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          const target = ev.target as HTMLDivElement;
          let scrollPos;

          switch (orientation) {
            case "horizontal":
              scrollPos = target.scrollLeft;
              break;
            case "vertical":
              scrollPos = target.scrollTop;
              break;
            default:
              throw new Error(`Invalid scrollable orientation ${orientation}`);
          }

          props.onScroll(scrollPos);
        }
      },
      SCROLL_DEBOUNCE_INTERVAL,
      { trailing: true }
    ),
    [props.onScroll]
  );

  const wrapper = useRef(null as unknown as HTMLDivElement);

  useEffect(() => {
    const el = wrapper.current;

    if (scroll != null && el != null) {
      let clamped;

      switch (orientation) {
        case "horizontal":
          clamped = clamp(scroll, 0, el.scrollWidth - el.clientLeft);
          wrapper.current.scrollLeft = clamped;
          break;
        case "vertical":
          clamped = clamp(scroll, 0, el.scrollHeight - el.clientHeight);
          wrapper.current.scrollTop = clamped;
          break;
        default:
          throw new Error(`Invalid scrollable orientation ${orientation}`);
      }

      if (scroll != clamped) {
        props.onScroll?.(clamped);
      }
    }
  }, [props.scroll]);

  return (
    <StyledDiv
      className={className}
      onScroll={onScroll}
      height={height}
      orientation={orientation}
      ref={wrapper}
    >
      {props.children}
    </StyledDiv>
  );
}

// We need to pass height otherwise the div will automatically grow to the size
// of it's content and it'll never show a scroll bar.
const StyledDiv = styled.div<{
  height: string;
  orientation: ScrollOrientation;
}>`
  ${(props) => {
    switch (props.orientation) {
      case "horizontal":
        return `
          overflow-y: hidden!important;
          overflow-x: auto;
        `;
      case "vertical":
        return `
          overflow-y: auto;
        `;
    }
  }}

  ${w100}
  height: ${(p) => p.height};

  ::-webkit-scrollbar {
    height: 0.4rem; // Horizontal scrollbar
    width: 1rem; // Vertical scrollbar
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${OpenColor.gray[7]};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${OpenColor.gray[8]};
  }
`;
