/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cloneDeep, isEmpty, pick } from "lodash";
import { deepUpdate } from "../shared/deepUpdate";
import { DeepPartial } from "tsdef";
import { Note } from "../shared/domain/note";
import { Shortcut } from "../shared/domain/shortcut";
import { UIEventType, UIEventInput } from "../shared/ui/events";
import { Section, AppState, serializeAppState } from "../shared/ui/app";
import { log } from "./logger";
import { arrayify } from "../shared/utils";

export interface Store {
  state: State;
  on: On;
  off: Off;
  dispatch: Dispatch;
}

export interface State extends AppState {
  notes: Note[];
  shortcuts: Shortcut[];
}

export type Dispatch = <ET extends UIEventType>(
  event: ET,
  ...value: UIEventInput<ET> extends void ? [undefined?] : [UIEventInput<ET>]
) => Promise<void>;

export type On = <ET extends UIEventType>(
  event: ET | ET[],
  listener: Listener<ET>,
) => void;

export type Off = <EType extends UIEventType>(
  event: EType | EType[],
  listener: Listener<EType>,
) => void;

export type Listener<ET extends UIEventType> = (
  ev: { type: ET; value: UIEventInput<ET> | undefined },
  s: StoreContext,
) => Promise<void> | void;

export type Focus = (
  section: Section[],
  opts?: { overwrite?: boolean },
) => void;

export interface StoreContext {
  setUI: SetUI;
  setShortcuts: SetShortcuts;
  setNotes: SetNotes;
  focus: Focus;
  getState(): State;
}

// UI supports partial updates since it's unlikely we'll want to do full updates
export type SetUI = (
  t: Transformer<AppState, DeepPartial<AppState>> | DeepPartial<AppState>,
) => void;

export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;
export type SetNotes = (t: Transformer<Note[]>) => void;

export type Transformer<S, R = S> = (previous: S) => R;

export type ListenerLookup = {
  [EV in UIEventType]?: Array<Listener<EV>>;
};

export function useStore(initialState: State): Store {
  const [state, setState] = useState(initialState);
  const listeners = useRef<ListenerLookup>({});
  const lastState = useRef(state as Readonly<State>);

  // We need to run these first
  useLayoutEffect(() => {
    lastState.current = cloneDeep(state);
  }, [state]);

  const setUI: SetUI = useCallback(transformer => {
    setState(prevState => {
      const prevUI = pick(prevState, "version", "editor", "sidebar", "focused");

      const updates =
        typeof transformer === "function" ? transformer(prevUI) : transformer;

      const ui = deepUpdate(prevUI, updates);
      const newState = {
        ...prevState,
        ...ui,
      };

      const newUI = pick(newState, "version", "editor", "sidebar", "focused");
      void window.ipc("app.saveAppState", serializeAppState(newUI));
      return newState;
    });
  }, []);

  /*
   * The following setters update local cache. They do not save to file because
   * data persistence is handled by the main thread.
   */

  const setShortcuts: SetShortcuts = transformer => {
    setState(prevState => ({
      ...prevState,
      shortcuts: transformer(prevState.shortcuts),
    }));
  };
  const setNotes: SetNotes = transformer => {
    setState(prevState => ({
      ...prevState,
      notes: transformer(prevState.notes),
    }));
  };

  const focus: Focus = useCallback(
    (sections, opts = { overwrite: false }) => {
      if (new Set(sections).size !== sections.length) {
        throw new Error(`Sections to focus must be unique`);
      }

      // Don't push new section if new first is the same.
      const { current: state } = lastState;
      if (!isEmpty(state.focused)) {
        if (state.focused[0] === sections[0]) {
          return;
        }
      }

      setUI(s => {
        // TODO: Clean this up. It's getting messy.

        // If only 1 new section move it to top of stack.
        if (sections.length === 1) {
          if (s.focused[0] == null || opts.overwrite) {
            return {
              focused: sections,
            };
          } else {
            return {
              focused: [sections[0], s.focused[0]],
            };
          }
        }
        // If multiple new sections assume we are wiping the stack.
        else {
          return {
            focused: sections,
          };
        }
      });
    },
    [setUI],
  );

  const store = useMemo(() => {
    const ctx = {
      setUI,
      setShortcuts,
      setNotes,
      focus,
      getState: () => lastState.current,
    };

    const dispatch: Dispatch = (async (event, value: any) => {
      const eventListeners: any = listeners.current[event];
      if (eventListeners == null || eventListeners.length === 0) {
        await log.debug(`No store listener found for ${event}.`);
        return;
      }

      const ev = { type: event, value };

      for (const l of eventListeners) {
        await l(ev as any, ctx);
      }
    }) as Dispatch;

    const on: On = <ET extends UIEventType>(
      event: ET | ET[],
      listener: Listener<ET>,
    ) => {
      const events = arrayify(event);
      for (const ev of events) {
        if (listeners.current[ev] == null) {
          listeners.current[ev] = [];
        }

        listeners.current[ev]!.push(listener as Listener<UIEventType>);
      }
    };

    const off: Off = (event, listener) => {
      const events = arrayify(event);
      for (const ev of events) {
        const index = listeners.current[ev]!.findIndex(l => l === listener);
        if (index === -1) {
          throw new Error(
            `No matching listener found on ${ev} for ${listener}`,
          );
        }

        listeners.current[ev]?.splice(index, 1);
      }
    };

    return { state, on, off, dispatch };
  }, [state, focus, setUI]);

  return store;
}
