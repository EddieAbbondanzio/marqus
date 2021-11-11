import { Reducer, useCallback, useEffect, useReducer } from "react";
import { CommandName, Execute } from "../commands";
import { KeyCode, parseKey } from "./keyCode";
import { findShortcut } from "./shortcuts";
import { useAsync } from "react-async-hook";

export interface Keyboard {
  enabled: boolean;
  activeKeys: Record<string, boolean | undefined>;
}

export interface KeyboardActionEnable {
  type: "enable";
}

export interface KeyboardActionDisable {
  type: "disable";
}

export interface KeyboardActionKeyDown {
  type: "keyDown";
  key: KeyCode;
}

export interface KeyboardActionKeyUp {
  type: "keyUp";
  key: KeyCode;
}

export type KeyboardAction =
  | KeyboardActionEnable
  | KeyboardActionDisable
  | KeyboardActionKeyDown
  | KeyboardActionKeyUp;

let execute: Execute;

/**
 * Hook to listen for keys being pressed / released.
 * Should only be called once in the root React component.
 */
export function useKeyboard(exe: Execute) {
  const [state, dispatch] = useReducer(reducer, {
    enabled: true,
    activeKeys: {},
  });

  const onKeyDown = ({ code }: KeyboardEvent) => {
    const key = parseKey(code);
    dispatch({ type: "keyDown", key });

    // See if we have any shortcuts to trigger
    const keys = Object.entries(state.activeKeys)
      .filter(([, active]) => active)
      .map(([key]) => key as KeyCode);

    const shortcut = findShortcut(keys);

    if (shortcut != null) {
      void execute(shortcut.command as CommandName, null!);
    }
  };

  const onKeyUp = ({ code }: KeyboardEvent) => {
    const key = parseKey(code);
    dispatch({ type: "keyUp", key });
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  return {
    isKeyDown: (key: KeyCode) => state.activeKeys[key] ?? false,
  };
}

const reducer: Reducer<Keyboard, KeyboardAction> = (state, action) => {
  let key: KeyCode;

  switch (action.type) {
    case "enable":
      return { ...state, enabled: true };

    case "disable":
      return { ...state, enabled: false };

    case "keyUp":
      ({ key } = action);
      return { ...state, activeKeys: { ...state.activeKeys, key: undefined } };

    case "keyDown":
      ({ key } = action);
      return { ...state, activeKeys: { ...state.activeKeys, key: true } };
  }
};
