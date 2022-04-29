import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Store, Listener } from "../store";
import { p2, w100 } from "../css";
import { Focusable } from "./shared/Focusable";
import { Ipc } from "../../shared/ipc";
import * as monaco from "monaco-editor";

const NOTE_SAVE_INTERVAL = 500; // ms
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

  // Heavily sampled: https://github.com/react-monaco-editor/react-monaco-editor
  // but also refactored it to be a function component.

  // Monaco and onChangeSub are stored as refs because we don't want the
  // component to re-render if either of them change.
  const containerElement = useRef<HTMLDivElement | null>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeSub = useRef<monaco.IDisposable | null>(null);

  const [loadedNoteId, setloadedNoteId] = useState<string | null>(null);

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

  // Mount / Unmount
  useEffect(() => {
    const { current: el } = containerElement;
    let resizeObserver: ResizeObserver | null = null;

    if (el != null) {
      monacoEditor.current = monaco.editor.create(el, {
        value: editor.content ?? "",
        ...MONACO_SETTINGS,
      });

      if (el == null) {
        return;
      }

      // Monaco requires us to listen for changes in container size and manually
      // trigger re-render
      resizeObserver = new ResizeObserver(() => {
        if (monacoEditor.current != null) {
          monacoEditor.current.layout();
        }
      });
      resizeObserver.observe(el);
    }

    return () => {
      resizeObserver?.disconnect();

      if (monacoEditor.current != null) {
        monacoEditor.current.dispose();

        const model = monacoEditor.current.getModel();
        if (model != null) {
          model.dispose();
        }
      }

      if (onChangeSub.current != null) {
        onChangeSub.current.dispose();
      }
    };
    // No dependencies so this hook only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback(() => {
    if (monacoEditor.current == null) {
      return;
    }
    const value = monacoEditor.current.getModel()?.getValue();
    if (value == null) {
      return;
    }

    store.dispatch("editor.setContent", value);
  }, [store]);

  useEffect(() => {
    if (monacoEditor.current == null) {
      return;
    }

    // Prevent memory leak
    onChangeSub.current?.dispose();

    onChangeSub.current =
      monacoEditor.current.onDidChangeModelContent(onChange);
  }, [onChange]);

  // Update monaco editor
  useEffect(() => {
    if (monacoEditor.current == null) {
      return;
    }

    const model = monacoEditor.current.getModel();
    if (model == null) {
      throw new Error("Editor model was null");
    }

    if (editor.noteId != null && editor.noteId !== loadedNoteId) {
      monacoEditor.current.pushUndoStop();
      // @ts-expect-error lol
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: editor.content,
          },
        ]
      );
      monacoEditor.current.pushUndoStop();
      setloadedNoteId(editor.noteId);
    }
  }, [editor, loadedNoteId, setloadedNoteId]);

  return (
    <StyledFocusable
      store={store}
      name="editor"
      onFocus={() => monacoEditor.current?.focus()}
    >
      <StyledEditor ref={containerElement}></StyledEditor>
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

  ctx.setUI((prev) => ({
    editor: {
      isEditting: !(prev.editor.isEditting ?? false),
    },
  }));
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
