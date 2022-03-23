import { debounce, head, isEmpty } from "lodash";
import { marked } from "marked";
import React, { ChangeEvent, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { parseResourceId } from "../../shared/domain/id";
import { InvalidOpError } from "../../shared/errors";
import { Store, StoreListener } from "../store";
import { p2, w100 } from "../styling";
import { Markdown } from "./Markdown";
import { Focusable } from "./shared/Focusable";
export interface EditorProps {
  store: Store;
}

export function Editor({ store }: EditorProps) {
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
  }, [store.state]);

  // Reload content on note change
  useEffect(() => {
    const { selected } = store.state.ui.sidebar;
    if (isEmpty(selected)) {
      return;
    }

    const first = head(selected)!;
    const [type] = parseResourceId(first);
    if (type !== "note") {
      return;
    }

    store.dispatch("editor.loadNote", first);
  }, [store.state.ui.sidebar.selected]);

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

const debouncedIpc = debounce(window.ipc, 500);

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

  let content = (await window.ipc("notes.loadContent", noteId)) ?? undefined;
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

    await debouncedIpc("notes.saveContent", { id: editor.noteId, content });
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

  // We don't actually save here. Saving is done every key press.

  ctx.setUI({
    editor: {
      isEditting: false,
    },
  });
};
