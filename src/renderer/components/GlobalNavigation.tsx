import React from "react";
import { Resizable } from "./shared/Resizable";
import { Scrollable } from "./shared/Scrollable";

export interface GlobalNavigationProps {
  width: string;
  scroll: number;
  onResize: (newWidth: string) => void;
  onScroll: (newScroll: number) => void;
}

export function GlobalNavigation({
  width,
  scroll,
  onResize,
  onScroll,
}: GlobalNavigationProps): JSX.Element {
  return (
    <Resizable width={width} onResize={onResize}>
      <Scrollable scroll={scroll} onScroll={onScroll}>
        <div>Some</div>
        <div>Some</div>
        <div>Some</div>
        <div>Some</div>
        <div>Some</div>
        <div>Some</div>
        <div>Some</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
        <div>Long</div>
      </Scrollable>
    </Resizable>
  );
}
