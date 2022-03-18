import { clamp, debounce } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

export interface ScrollableProps {
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
    <StyledDiv onScroll={onScroll} ref={wrapper}>
      {props.children}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  flex-grow: 1;
  overflow-y: auto;
  overlow-x: visible;
`;
