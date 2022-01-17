import { RefObject, useEffect, useState } from "react";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { ElementOrWindow, isRef } from "../types";

export type KeyboardEventType = "keydown" | "keyup" | "press";

export interface KeyboardListenOpts<Keys extends KeyCode[]> {
  event: KeyboardEventType;
  keys?: Keys;
}

export type KeyboardCallback<Keys extends KeyCode[]> = (
  ev: KeyboardEvent,
  key: Keys[number]
) => Promise<void>;

export interface Keyboard {
  listen<Keys extends KeyCode[]>(
    opts: KeyboardListenOpts<Keys>,
    callback: KeyboardCallback<Keys>
  ): void;
}

export class KeyboardController implements Keyboard {
  constructor(public target?: ElementOrWindow) {}

  listeners: {
    [ev in KeyboardEventType]+?: {
      callback: KeyboardCallback<KeyCode[]>;
      keys?: KeyCode[];
    };
  } = {};

  listen<Keys extends KeyCode[]>(
    opts: KeyboardListenOpts<Keys>,
    callback: KeyboardCallback<Keys>
  ): void {
    this.listeners[opts.event] = {
      ...opts,
      callback,
    };
  }

  notify(event: KeyboardEvent, type: KeyboardEventType) {
    const key = parseKeyCode(event.code);
    const listener = this.listeners[type];

    if (listener == null) {
      return;
    }
    const target = isRef<HTMLElement>(this.target)
      ? this.target.current
      : window;
    if (event.target !== target) {
      return;
    }

    if (listener.keys != null && listener.keys.every((k) => k !== key)) {
      return;
    }

    listener.callback(event, key);
  }
}

/**
 * Keyboard controller for listening for specific keys. Should only be used in
 * instances where we don't want to support remapping.
 * @param elOrWindow Target
 * @returns Keyboard controlller
 */
export function useKeyboard(elOrWindow: ElementOrWindow): Keyboard {
  const keyboard = new KeyboardController(elOrWindow);

  const onKeyDown = (ev: KeyboardEvent) => keyboard.notify(ev, "keydown");
  const onKeyPress = (ev: KeyboardEvent) => keyboard.notify(ev, "press");
  const onKeyUp = (ev: KeyboardEvent) => keyboard.notify(ev, "keyup");

  useEffect(() => {
    const target = isRef(elOrWindow) ? elOrWindow.current : elOrWindow;
    if (target == null) {
      return;
    }

    target.addEventListener("keydown", onKeyDown);
    target.addEventListener("keypress", onKeyPress);
    target.addEventListener("keyup", onKeyUp);

    return () => {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keypress", onKeyPress);
      target.removeEventListener("keyup", onKeyUp);
    };
  });

  return keyboard;
}
