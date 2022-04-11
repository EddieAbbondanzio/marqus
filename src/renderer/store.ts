import { UIEventType, UIEventInput, UI } from "../shared/domain/ui";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { deepUpdate } from "./utils/deepUpdate";
import { InvalidOpError } from "../shared/errors";
import { DeepPartial } from "tsdef";
import { Note } from "../shared/domain/note";
import { Shortcut } from "../shared/domain/shortcut";
import { Tag } from "../shared/domain/tag";

export type Transformer<S> = (previous: S) => S;
export type PartialTransformer<S> = (previous: S) => DeepPartial<S>;

export interface State {
  ui: UI;
  tags: Tag[];
  notes: Note[];
  shortcuts: Shortcut[];
}

export interface StoreControls {
  setUI: SetUI;
  setTags: SetTags;
  setShortcuts: SetShortcuts;
  setNotes: SetNotes;
  getState(): State;
}

/**
 * SetUI supportes partial updates since it's unlikely we'll want to update
 * every single property at once. This also works for nested props.
 */
export type SetUI = (t: PartialTransformer<UI> | DeepPartial<UI>) => void;
export type SetTags = (t: Transformer<Tag[]>) => void;
export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;
export type SetNotes = (t: Transformer<Note[]>) => void;

export interface Store {
  dispatch: Dispatch;
  state: State;
  on<ET extends UIEventType>(
    event: ET | ET[],
    listener: StoreListener<ET>
  ): void;
  off<EType extends UIEventType>(
    event: EType | EType[],
    listener: StoreListener<EType>
  ): void;
}

export type Dispatch = <ET extends UIEventType>(
  event: ET,
  ...value: UIEventInput<ET> extends void ? [undefined?] : [UIEventInput<ET>]
) => Promise<void>;

export type StoreListener<ET extends UIEventType> = (
  ev: { type: ET; value: UIEventInput<ET> },
  s: StoreControls
) => Promise<void> | void;

export function useStore(initialState: State): Store {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts
  const [state, setState] = useState(initialState);
  const [listeners, setListeners] = useState<{
    [eType in UIEventType]+?: StoreListener<eType>;
  }>({});
  const lastState = useRef(state);

  // We need to run these first
  useLayoutEffect(() => {
    lastState.current = state;
  }, [state]);

  const getState = useCallback((): State => {
    const cloned = cloneDeep(lastState.current);
    return cloned;
  }, []);

  const setUI: SetUI = (transformer) => {
    setState((prevState) => {
      const updates =
        typeof transformer === "function"
          ? transformer(prevState.ui)
          : transformer;

      const ui = deepUpdate(prevState.ui, updates);
      const newState = {
        ...prevState,
        ui,
      };

      // We need to delete some values before sending them over to the main
      // thread otherwise electron will throw an error.
      const clonedUI = cloneDeep(newState.ui);
      if (clonedUI?.sidebar != null) {
        delete clonedUI.sidebar.input;
      }
      if (clonedUI?.editor != null) {
        delete clonedUI.editor.content;
        delete clonedUI.editor.noteId;
      }

      void window.ipc("app.saveUIState", clonedUI);
      return newState;
    });
  };

  /*
   * The following setters are to update local cache. They do not
   * perform any saving to file because all of that is handled by the ipcs.
   */

  const setTags: SetTags = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      tags: transformer(prevState.tags),
    }));
  };
  const setShortcuts: SetShortcuts = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      shortcuts: transformer(prevState.shortcuts),
    }));
  };
  const setNotes: SetNotes = (transformer) => {
    setState((prevState) => ({
      ...prevState,
      notes: transformer(prevState.notes),
    }));
  };

  const dispatch: Dispatch = useCallback(
    async (event, value: any) => {
      const listener = listeners[event];
      if (listener == null) {
        throw Error(`No listener for ${event} found.`);
      }

      await listener({ type: event, value } as any, {
        setUI,
        setTags,
        setShortcuts,
        setNotes,
        getState,
      });
    },
    [listeners, getState]
  );

  const on: Store["on"] = (event, listener) => {
    setListeners((prev) => {
      const flatten = Array.isArray(event) ? event : [event];
      flatten.forEach((e) => (prev[e] = listener as any));
      return prev;
    });
  };

  const off: Store["off"] = (event, listener) => {
    setListeners((prev) => {
      const flatten = Array.isArray(event) ? event : [event];
      flatten.forEach((e) => {
        if (prev[e] != listener) {
          console.error("prev[e]:", prev[e]);
          console.error("listener: ", listener);
          throw new InvalidOpError(
            `Listener to remove for ${e} was not a match.`
          );
        }
      });

      return prev;
    });
  };

  return {
    state,
    on,
    off,
    dispatch,
  };
}
