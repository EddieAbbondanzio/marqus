import { Coord } from "./utils/dom";
import { Section, UI } from "../shared/domain/ui";
import { StartsWith } from "./types";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { deepUpdate } from "./utils/deepUpdate";
import { InvalidOpError } from "../shared/errors";
import { DeepPartial } from "tsdef";
import { Note } from "../shared/domain/note";
import { Shortcut } from "../shared/domain/shortcut";
import { Tag } from "../shared/domain/tag";

export interface Events {
  // Global
  "app.openDevTools": void;
  "app.reload": void;
  "app.toggleFullScreen": void;
  "app.inspectElement": Coord;

  // Sidebar
  "sidebar.toggle": void;
  "sidebar.updateScroll": number;
  "sidebar.scrollDown": void;
  "sidebar.scrollUp": void;
  "sidebar.resizeWidth": string;
  "sidebar.toggleFilter": void;
  "sidebar.createNote": string | null;
  "sidebar.renameNote": string;
  "sidebar.dragNote": { note: string; newParent?: string };
  "sidebar.deleteNote": string;
  "sidebar.setSelection": string[];
  "sidebar.clearSelection": void;
  "sidebar.toggleItemExpanded": string;
  "sidebar.moveSelectionUp": void;
  "sidebar.moveSelectionDown": void;

  // Editor
  "editor.save": void;
  "editor.toggleView": void;
  "editor.setContent": string;
  "editor.loadNote": string;

  // Focus Tracker
  "focus.push": Section;
  "focus.pop": void;

  // Context Menu
  "contextMenu.blur": void;
  "contextMenu.run": void;
  "contextMenu.moveSelectionUp": void;
  "contextMenu.moveSelectionDown": void;
}
export type EventType = keyof Events;
export type EventValue<Ev extends EventType> = Events[Ev];
export type EventsForNamespace<Namespace extends string> = Pick<
  Events,
  StartsWith<EventType, Namespace>
>;

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
  on<EType extends EventType>(
    event: EType | EType[],
    listener: StoreListener<EType>
  ): void;
  off<EType extends EventType>(
    event: EType | EType[],
    listener: StoreListener<EType>
  ): void;
}

export type Dispatch = <EType extends EventType>(
  event: EType,
  ...value: EventValue<EType> extends void ? [undefined?] : [EventValue<EType>]
) => Promise<void>;

export type StoreListener<EType extends EventType> = (
  ev: { type: EType; value: EventValue<EType> },
  s: StoreControls
) => Promise<void> | void;

export function useStore(initialState: State): Store {
  // Sampled: https://github.com/dai-shi/use-reducer-async/blob/main/src/index.ts
  const [state, setState] = useState(initialState);
  const [listeners, setListeners] = useState<{
    [eType in EventType]+?: StoreListener<eType>;
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
