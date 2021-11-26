import { Dispatch, Reducer, useEffect, useReducer } from "react";
import { CommandName, Execute } from "../commands";
import { chain, cloneDeep, isEqual } from "lodash";
import { Shortcut, Shortcuts, UISection } from "../../shared/domain";
import { KeyCode, parseKeyCode, sort } from "../../shared/io/keyCode";

export interface Keyboard {
  enabled: boolean;
  activeKeys: Record<string, boolean | undefined>;
  previousKeys: KeyCode[];
  shortcuts: Shortcut[];
  repeating?: NodeJS.Timer;
}

export type IsKeyDown = (key: KeyCode) => boolean;

export interface KeyboardLoadShortcuts {
  type: "loadShortcuts";
  shortcuts: Shortcut[];
}

export interface KeyboardEnable {
  type: "enable";
}

export interface KeyboardDisable {
  type: "disable";
}

export interface KeyboardKeyDown {
  type: "keyDown";
  key: KeyCode;
}

export interface KeyboardKeyUp {
  type: "keyUp";
  key: KeyCode;
}

export interface KeyboardSetPreviousKeys {
  type: "setPreviousKeys";
  previousKeys: KeyCode[];
}

// Add start timer event?

export type KeyboardAction =
  | KeyboardEnable
  | KeyboardDisable
  | KeyboardKeyDown
  | KeyboardKeyUp
  | KeyboardLoadShortcuts
  | KeyboardSetPreviousKeys;

export enum RepeatDelay {
  First = 500,
  Remainder = 100,
}

export const toArray = (activeKeys: Keyboard["activeKeys"]): KeyCode[] =>
  chain(activeKeys)
    .entries()
    .filter(([, active]) => active === true)
    .map(([key]) => key as KeyCode)
    .tap(sort)
    .value();

/**
 * Hook to listen for keys being pressed / released.
 * Should only be called once in the root React component.
 */
export function useKeyboard(
  shortcuts: Shortcuts,
  execute: Execute,
  isFocused: (section: UISection) => boolean
) {
  const reducer: Reducer<Keyboard, KeyboardAction> = (state, action) => {
    let key: KeyCode;
    let previousKeys: KeyCode[];

    switch (action.type) {
      case "enable":
        return { ...state, enabled: true };

      case "disable":
        return { ...state, enabled: false };

      case "keyUp":
        ({ key } = action);
        return {
          ...state,
          activeKeys: { ...state.activeKeys, [key]: undefined },
        };

      case "keyDown":
        ({ key } = action);
        return { ...state, activeKeys: { ...state.activeKeys, [key]: true } };

      case "loadShortcuts":
        return {
          ...state,
          // s.disabled != false is intentional. !s.disabled will exclude shortcuts
          // with disabled = undefined.
          shortcuts: action.shortcuts.filter((s) => s.disabled != false),
        };

      case "setPreviousKeys":
        previousKeys = cloneDeep(action.previousKeys);
        return { ...state, previousKeys };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    enabled: true,
    activeKeys: {},
    previousKeys: [],
    shortcuts: shortcuts.values,
  });

  /*
   * We have to wrap event listeners so we can pass and additional
   * argument to them.
   */

  const keyDown = (ev: KeyboardEvent) => {
    /*
     * Disable all default shortcuts. It seems a little silly to re-implement
     * everything but this gives the user a chance to redefine or disable any
     * shortcut.
     */
    ev.preventDefault();

    // Prevent redundant calls
    if (!ev.repeat) {
      onKeyDown(dispatch, ev);
    }
  };

  const keyUp = (ev: KeyboardEvent) => onKeyUp(dispatch, ev);

  useEffect(
    () => {
      const activeKeys = toArray(state.activeKeys);
      const { previousKeys } = state;

      if (!isEqual(activeKeys, previousKeys)) {
        const shortcut = state.shortcuts.find(
          (s) => isEqual(s.keys, activeKeys) && !s.disabled
        );

        /*
         * Try to find a shortcut and execute it.
         * Everytime state changes, aka dispatch() is fired we trigger a
         * re-render. This gives us the perfect change to check for commands
         * to fire because it means the keys have changed.
         */
        if (shortcut != null) {
          if (shortcut.when != null && !isFocused(shortcut.when)) {
            return;
          }

          // undefined over null so we can support default parameters
          void execute(shortcut.command as CommandName, undefined!);
          dispatch({ type: "setPreviousKeys", previousKeys });
        }
      }
    },
    /*
     * state.activeKeys is a required dependency as it protects us from
     * rapidly re-executing the command on each render.
     */
    [state.activeKeys]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return {
    isKeyDown: (key: KeyCode) => state.activeKeys[key] ?? false,
  } as { isKeyDown: IsKeyDown };
}

const onKeyDown = (
  dispatch: Dispatch<KeyboardAction>,
  { code }: KeyboardEvent
) => {
  const key = parseKeyCode(code);
  dispatch({ type: "keyDown", key });
};

const onKeyUp = (
  dispatch: Dispatch<KeyboardAction>,
  { code }: KeyboardEvent
) => {
  const key = parseKeyCode(code);
  dispatch({ type: "keyUp", key });
};
