import { debounce } from "lodash";
import { marked } from "marked";
import React, { ChangeEvent, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
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
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
    };
  }, [store.state]);

  const onChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    store.dispatch("editor.setContent", ev.target.value);
  };

  const textareaRef = useRef(null! as HTMLTextAreaElement);
  const content = editor.isEditting ? (
    <textarea
      ref={textareaRef}
      value={editor.content}
      onChange={onChange}
    ></textarea>
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

const debouncedIpc = debounce(window.ipc, 500);

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
