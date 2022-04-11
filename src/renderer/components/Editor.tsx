import { debounce, head, isEmpty } from "lodash";
import React, { ChangeEvent, useEffect, useRef } from "react";
import styled from "styled-components";
import { parseResourceId } from "../../shared/domain";
import { InvalidOpError } from "../../shared/errors";
import { Store, StoreListener } from "../store";
import { p2, w100 } from "../css";
import { Markdown } from "./Markdown";
import { Focusable } from "./shared/Focusable";
import { getNoteById } from "../../shared/domain/note";

const NOTE_SAVE_INTERVAL = 500;

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
    store.dispatch("editor.setContent", ev.target.value);
  };

  const textareaRef = useRef(null! as HTMLTextAreaElement);
  const content = editor.isEditting ? (
    <StyledTextarea
      ref={textareaRef}
      value={editor.content}
      onChange={onChange}
    ></StyledTextarea>
  ) : (
    <Markdown content={editor.content!} />
  );

  return (
    <StyledFocusable
      store={store}
      name="editor"
      onFocus={() => textareaRef.current?.focus()}
    >
      {content}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  ${w100}
  ${p2}
`;

const StyledTextarea = styled.textarea`
  height: 100%;
  width: 100%;
`;

const debouncedInvoker = debounce(window.ipc.invoke, NOTE_SAVE_INTERVAL);

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

  const content =
    (await window.ipc.invoke("notes.loadContent", noteId)) ?? undefined;
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

    await debouncedInvoker("notes.saveContent", { id: editor.noteId, content });
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
