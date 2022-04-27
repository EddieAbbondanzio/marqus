import { debounce, head, isEmpty } from "lodash";
import React, { ChangeEvent, useEffect, useRef } from "react";
import styled from "styled-components";
import { parseResourceId } from "../../shared/domain";
import { InvalidOpError } from "../../shared/errors";
import { Store, StoreListener } from "../store";
import { p2, w100 } from "../css";
import { Focusable } from "./shared/Focusable";
import { getNoteById } from "../../shared/domain/note";
import { Ipc } from "../../shared/ipc";
import * as monaco from "monaco-editor";

const NOTE_SAVE_INTERVAL = 500; //ms
const MONACO_SETTINGS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: "markdown",
  lineNumbers: "off",
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  minimap: {
    enabled: false,
  },
};

export interface EditorProps {
  store: Store;
}

export function Editor({ store }: EditorProps): JSX.Element {
  const {
    ui: { editor },
  } = store.state;
  useEffect(() => {
    store.on("editor.loadNote", loadNote);
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);

    return () => {
      store.off("editor.loadNote", loadNote);
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
    };
  }, [store]);

  // Reload content on note change
  useEffect(() => {
    const { selected } = store.state.ui.sidebar;
    if (isEmpty(selected)) {
      return;
    }

    const first = head(selected)!;
    const [type] = parseResourceId(first);

    if (
      type !== "note" ||
      getNoteById(store.state.notes, first, false) == null
    ) {
      return;
    }

    store.dispatch("editor.loadNote", first);
  }, [store]);

  const onChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    console.log("CHANGE");
    store.dispatch("editor.setContent", ev.target.value);
  };

  const editorRef = useRef(null as HTMLDivElement | null);
  useEffect(() => {
    if (editorRef.current == null) {
      return;
    }

    const e = monaco.editor.create(editorRef.current, {
      value: editor.content ?? "",
      ...MONACO_SETTINGS,
    });

    return () => {
      e.dispose();
    };
  }, [editorRef, editor]);

  return (
    <StyledFocusable
      store={store}
      name="editor"
      onFocus={() => editorRef.current?.focus()}
    >
      <StyledEditor ref={editorRef}></StyledEditor>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  ${w100}
  ${p2}
`;

const StyledEditor = styled.div`
  height: 100%;
  width: 100%;
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL) as Ipc;

const loadNote: StoreListener<"editor.loadNote"> = async (
  { value: noteId },
  ctx
) => {
  const state = ctx.getState();
  if (noteId === state.ui.editor.noteId) {
    return;
  }

  const [type] = parseResourceId(noteId);
  if (type !== "note") {
    throw new InvalidOpError(`${noteId} is not a note`);
  }

  const content = (await window.ipc("notes.loadContent", noteId)) ?? undefined;
  ctx.setUI({
    editor: {
      content,
      noteId,
    },
  });
};

const setContent: StoreListener<"editor.setContent"> = async (
  { value: content },
  ctx
) => {
  const {
    ui: { editor },
  } = ctx.getState();
  if (editor.noteId != null) {
    ctx.setUI({
      editor: {
        content,
      },
    });

    await debouncedInvoker("notes.saveContent", editor.noteId, content);
  }
};

const toggleView: StoreListener<"editor.toggleView"> = (_, ctx) => {
  const {
    ui: { editor },
  } = ctx.getState();
  if (editor.noteId == null) {
    return;
  }

  ctx.setUI((prev) => ({
    editor: {
      isEditting: !(prev.editor.isEditting ?? false),
    },
  }));
};

const save: StoreListener<"editor.save"> = (_, ctx) => {
  const {
    ui: { editor },
  } = ctx.getState();

  if (!editor.isEditting || editor.noteId == null) {
    return;
  }

  /*
   * We don't actually do any saving within this listener. This is just a fake
   * save function for the user to change the app back to read view.
   */

  ctx.setUI({
    editor: {
      isEditting: false,
    },
  });
};
