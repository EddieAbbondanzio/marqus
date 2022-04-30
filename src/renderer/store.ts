import { UIEventType, UIEventInput, UI } from "../shared/domain/ui";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { deepUpdate } from "./utils/deepUpdate";
import { DeepPartial } from "tsdef";
import { Note } from "../shared/domain/note";
import { Shortcut } from "../shared/domain/shortcut";
import { Tag } from "../shared/domain/tag";

export interface Store {
  state: State;
  on: On;
  off: Off;
  dispatch: Dispatch;
}

export interface State {
  ui: UI;
  tags: Tag[];
  notes: Note[];
  shortcuts: Shortcut[];
}

export type Dispatch = <ET extends UIEventType>(
  event: ET,
  ...value: UIEventInput<ET> extends void ? [undefined?] : [UIEventInput<ET>]
) => Promise<void>;

export type On = <ET extends UIEventType>(
  event: ET | ET[],
  listener: Listener<ET>
) => void;

export type Off = <EType extends UIEventType>(
  event: EType | EType[],
  listener: Listener<EType>
) => void;

export type Listener<ET extends UIEventType> = (
  ev: { type: ET; value: UIEventInput<ET> },
  s: StoreContext
) => Promise<void> | void;

export interface StoreContext {
  setUI: SetUI;
  setTags: SetTags;
  setShortcuts: SetShortcuts;
  setNotes: SetNotes;
  getState(): State;
}

// UI supports partial updates since it's unlikely we'll want to do full updates
export type SetUI = (
  t: Transformer<UI, DeepPartial<UI>> | DeepPartial<UI>
) => void;
export type SetTags = (t: Transformer<Tag[]>) => void;
export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;
export type SetNotes = (t: Transformer<Note[]>) => void;

export type Transformer<S, R = S> = (previous: S) => R;

export function useStore(initialState: State): Store {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts
  const [state, setState] = useState(initialState);
  const listeners = useRef<{
    [eType in UIEventType]+?: Array<Listener<eType>>;
  }>({});
  const lastState = useRef(state as Readonly<State>);

  // We need to run these first
  useLayoutEffect(() => {
    lastState.current = cloneDeep(state);
  }, [state]);

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

  const dispatch: Dispatch = useCallback(async (event, value: any) => {
    const eventListeners = listeners.current[event];
    if (eventListeners == null || eventListeners.length == 0) {
      return;
    }

    const ev = { type: event, value };
    const ctx = {
      setUI,
      setTags,
      setShortcuts,
      setNotes,
      getState: () => lastState.current,
    };
    for (const l of eventListeners as any[]) {
      await l(ev, ctx);
    }
  }, []);

  const on: On = (event, listener) => {
    const events = Array.isArray(event) ? event : [event];
    for (const ev of events) {
      listeners.current[ev] ??= [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      listeners.current[ev]?.push(listener);
    }
  };

  const off: Off = (event, listener) => {
    const events = Array.isArray(event) ? event : [event];
    for (const ev of events) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      listeners.current[ev] = listeners.current[ev]?.filter(
        (l: any) => l !== listener
      ) as any[];
    }
  };

  const store = useMemo(
    () => ({ state, on, off, dispatch }),
    [dispatch, state]
  );

  return store;
}
