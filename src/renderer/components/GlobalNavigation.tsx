import React, { useCallback, useRef, useState } from "react";
import { px } from "../dom/units";
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
}: GlobalNavigationProps) {
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
