import {
  Dispatch,
  Reducer,
  ReducerAction,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { CommandName, COMMAND_REGISTRY, Execute } from "../commands";
import { useAsync } from "react-async-hook";
import { chain, isEqual, partition, uniq } from "lodash";
import { DEFAULT_SHORTCUTS } from "../../shared/io/defaultShortcuts";
import { IsFocused } from "../ui/focusables";
import * as yup from "yup";
import { SchemaOf } from "yup";
import { sleep } from "../../shared/utils/sleep";
import { Shortcut, ShortcutOverride, Shortcuts } from "../../shared/domain";
import {
  isModifier,
  isValidKeyCode,
  KeyCode,
  parseKeyCode,
  sort,
} from "../../shared/io/keyCode";

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

export interface KeyboardStartRepeat {
  type: "startRepeat";
  shortcut: Shortcut;
  repeating: NodeJS.Timer;
}

export interface KeyboardStopRepeat {
  type: "stopRepeat";
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
  | KeyboardStartRepeat
  | KeyboardStopRepeat
  | KeyboardSetPreviousKeys;

export enum RepeatDelay {
  First = 500,
  Remainder = 100,
}

let isRepeating = false;

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
  isFocused: IsFocused
) {
  const reducer: Reducer<Keyboard, KeyboardAction> = (state, action) => {
    let key: KeyCode;

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

      case "startRepeat":
        return { ...state, repeating: action.repeating };

      case "stopRepeat":
        if (state.repeating == null) {
          return state;
        }

        isRepeating = false;
        return { ...state, repeating: undefined };

      case "setPreviousKeys":
        console.log("set active keys: ", action.previousKeys);
        return { ...state, previousKeys: action.previousKeys };
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
    // Prevent redundant calls
    if (ev.repeat) {
      return;
    }

    /*
     * Disable all default shortcuts. It seems a little silly to re-implement
     * everything but this gives the user a chance to redefine or disable any
     * shortcut.
     */
    ev.preventDefault();

    onKeyDown(dispatch, ev);
  };

  const keyUp = (ev: KeyboardEvent) => onKeyUp(dispatch, ev);

  useEffect(
    () => {
      const activeKeys = toArray(state.activeKeys);
      const { previousKeys } = state;

      let repeating: NodeJS.Timer | undefined;

      if (!isEqual(activeKeys, previousKeys)) {
        console.log("keys weren't active! prev keys: ", previousKeys);

        // Kill previous shortcut if running on repeat in loop (.repeat = true)
        dispatch({ type: "stopRepeat" });

        const shortcut = state.shortcuts.find((s) =>
          isEqual(s.keys, activeKeys)
        );

        /*
         * Try to find a shortcut and execute it.
         * Everytime state changes, aka dispatch() is fired we trigger a
         * re-render. This gives us the perfect change to check for commands
         * to fire because it means the keys have changed.
         */
        if (shortcut != null && !shortcut.disabled) {
          // undefined! over null! so we can support default parameters
          void execute(shortcut.command as CommandName, undefined!);
          dispatch({ type: "setPreviousKeys", previousKeys });

          if (shortcut.repeat) {
            (async () => {
              const prevKeys = activeKeys;
              await sleep(RepeatDelay.First);
              const currKeys = toArray(state.activeKeys);

              if (isEqual(currKeys, prevKeys)) {
                repeating = setInterval(() => {
                  // Casts are gross
                  void execute(shortcut.command as CommandName, undefined!);
                }, RepeatDelay.Remainder);

                dispatch({ type: "startRepeat", shortcut, repeating });
              }
            })();
          }

          /*
           * Prevent the chance of creating a memory leak.
           * Also prevents from spamming intervals
           */
          return () => {
            if (repeating != null) {
              clearInterval(repeating);
              repeating = undefined;
            }
          };
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
