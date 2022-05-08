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
  onScroll?: (scrollPos: number) => void;
}

export function Scrollable(props: React.PropsWithChildren<ScrollableProps>) {
  // Debounce it so we don't spam the event handler.
  const onScroll = useCallback(
    debounce(
      (ev: React.UIEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          const newPos = (ev.target as HTMLDivElement).scrollTop;
          props.onScroll(newPos);
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

    if (props.scroll != null && el != null) {
      const clamped = clamp(props.scroll, 0, el.scrollHeight - el.clientHeight);
      wrapper.current.scrollTop = clamped;

      if (props.scroll != clamped) {
        props.onScroll?.(clamped);
      }
    }
  }, [props.scroll]);

  return (
    <StyledDiv
      className={props.className}
      onScroll={onScroll}
      height={props.height ?? "100%"}
      ref={wrapper}
    >
      {props.children}
    </StyledDiv>
  );
}

// We need to pass height otherwise the div will automatically grow to the size
// of it's content and it'll never show a scroll bar.
const StyledDiv = styled.div<{ height: string }>`
  overflow-y: auto;
  ${w100}
  height: ${(p) => p.height};

  ::-webkit-scrollbar {
    width: 10px;
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
