import { debounce, head, isEmpty } from "lodash";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { Section } from "../../shared/domain/ui/sections";
import { Ipc } from "../../shared/ipc";
import { w100, p2, m2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";

const NOTE_SAVE_INTERVAL_MS = 500;

interface EditorProps {
  store: Store;
}

export function Editor({ store }: EditorProps): JSX.Element {
  let content;
  if (store.state.ui.editor.isEditting) {
    content = <Monaco store={store} />;
  } else {
    content = (
      <Markdown
        store={store}
        content={store.state.ui.editor.content ?? ""}
        scroll={store.state.ui.editor.scroll}
        onScroll={(newVal) =>
          void store.dispatch("editor.updateScroll", newVal)
        }
      />
    );
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.loadNote", loadNote);
    store.on("editor.updateScroll", updateScroll);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.loadNote", loadNote);
      store.off("editor.updateScroll", updateScroll);
    };
  }, [store]);

  return (
    <StyledFocusable store={store} name={Section.Editor} focusOnRender={false}>
      {content}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  ${m2}
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL_MS) as Ipc;

const loadNote: Listener<"editor.loadNote"> = async (ev, ctx) => {
  const state = ctx.getState();
  let noteId: string;

  // If no note was passed, attempt to load the selected note
  if (ev.value == null) {
    // User could accidentally press delete when nothing is selected so we
    // don't throw here.
    const { selected } = state.ui.sidebar;
    if (isEmpty(selected)) {
      return;
    }

    noteId = head(selected)!;
  } else {
    noteId = ev.value;
  }

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

  // Opened selected note, gotta override!
  if (ev.value == null) {
    ctx.focus([Section.Editor], { overwrite: true });
  }
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

export const updateScroll: Listener<"editor.updateScroll"> = (
  { value: scroll },
  ctx
) => {
  if (scroll == null) {
    throw Error();
  }

  ctx.setUI({
    editor: {
      scroll,
    },
  });
};
