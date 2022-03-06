import { marked } from "marked";
import React, { ChangeEvent, useEffect, useRef } from "react";
import { Store, StoreListener } from "../store";
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

  const onInput = (ev: ChangeEvent<HTMLInputElement>) => {
    store.dispatch("editor.setContent", ev.target.value);
  };

  const inputRef = useRef(null! as HTMLInputElement);

  const content = editor.isEditting ? (
    <input ref={inputRef} value={editor.content} onChange={onInput}></input>
  ) : (
    <Markdown content={editor.content!} />
  );

  const onFocus = () => {
    inputRef.current?.focus();
  };
  const onBlur = () => {};

  return (
    <Focusable store={store} name="editor" onFocus={onFocus} onBlur={onBlur}>
      {content}
    </Focusable>
  );
}

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
    await window.rpc("notes.saveContent", { id: editor.noteId, content });
  }
};

const toggleView: StoreListener<"editor.toggleView"> = (_, ctx) => {
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

  if (!editor.isEditting) {
    return;
  }

  // We don't actually save here. Saving is done every key press.

  ctx.setUI({
    editor: {
      isEditting: false,
    },
  });
};
