import { debounce } from "lodash";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Ipc } from "../../shared/ipc";
import { w100, p2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";

const NOTE_SAVE_INTERVAL = 500; // ms

interface EditorProps {
  store: Store;
}

export function Editor({ store }: EditorProps): JSX.Element {
  let content;
  if (store.state.ui.editor.isEditting) {
    content = <Monaco store={store} />;
  } else {
    content = <Markdown content={store.state.ui.editor.content ?? ""} />;
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.loadNote", loadNote);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.loadNote", loadNote);
    };
  }, [store]);

  return (
    <StyledFocusable store={store} name="editor" autoFocus={false}>
      {content}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  ${w100}
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL) as Ipc;

const loadNote: Listener<"editor.loadNote"> = async (
  { value: noteId },
  ctx
) => {
  const state = ctx.getState();
  if (noteId === state.ui.editor.noteId) {
    return;
  }

  const content = (await window.ipc("notes.loadContent", noteId)) ?? undefined;
  ctx.setUI({
    editor: {
      content,
      noteId,
    },
  });
};

const setContent: Listener<"editor.setContent"> = async (
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

const toggleView: Listener<"editor.toggleView"> = (_, ctx) => {
  const {
    ui: { editor },
  } = ctx.getState();
  if (editor.noteId == null) {
    return;
  }

  ctx.setUI({
    editor: {
      isEditting: !editor.isEditting,
    },
  });
};

const save: Listener<"editor.save"> = (_, ctx) => {
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
