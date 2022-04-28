import { debounce, head, isEmpty } from "lodash";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { parseResourceId } from "../../shared/domain";
import { InvalidOpError } from "../../shared/errors";
import { Store, StoreListener } from "../store";
import { p2, w100 } from "../css";
import { Focusable } from "./shared/Focusable";
import { getNoteById } from "../../shared/domain/note";
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

  const containerElement = useRef<HTMLDivElement | null>(null);
  const [monacoEditor, setMonacoEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [onChangeSub, setOnChangeSub] = useState<monaco.IDisposable | null>(
    null
  );
  const [loadedNoteId, setloadedNoteId] = useState<string | null>(null);

  // Mount / Unmount
  useEffect(() => {
    if (containerElement.current != null) {
      setMonacoEditor(
        monaco.editor.create(containerElement.current, {
          value: editor.content ?? "",
          ...MONACO_SETTINGS,
        })
      );
    }

    return () => {
      if (monacoEditor != null) {
        monacoEditor.dispose();

        const model = monacoEditor.getModel();
        if (model != null) {
          model.dispose();
        }
      }

      if (onChangeSub != null) {
        onChangeSub.dispose();
      }
    };
    // No dependencies so this hook only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = useCallback(() => {
    if (monacoEditor == null) {
      return;
    }
    const value = monacoEditor.getModel()?.getValue();
    if (value == null) {
      return;
    }

    store.dispatch("editor.setContent", value);
  }, [store, monacoEditor]);

  useEffect(() => {
    if (monacoEditor == null) {
      return;
    }

    // Subscribe to changes
    setOnChangeSub(monacoEditor.onDidChangeModelContent(onChange));
  }, [monacoEditor, onChange]);

  // Update monaco editor
  useEffect(() => {
    if (monacoEditor == null) {
      return;
    }

    const model = monacoEditor.getModel();
    if (model == null) {
      throw new Error("Editor model was null");
    }

    if (editor.noteId != null && editor.noteId !== loadedNoteId) {
      monacoEditor.pushUndoStop();
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
      this.editor.pushUndoStop();
      setloadedNoteId(editor.noteId);
    }
  }, [monacoEditor, editor, loadedNoteId, setloadedNoteId]);

  // Monaco doesn't listen for container size changes so we re-trigger it's
  // layout calculations each time a size change occurs.
  useEffect(() => {
    const { current: el } = containerElement;
    if (el == null) {
      return;
    }

    const onResize = () => {
      if (monacoEditor != null) {
        monacoEditor.layout();
      }
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [containerElement, monacoEditor]);

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

  return (
    // <StyledFocusable
    // store={store}
    // name="editor"
    // onFocus={() => editorRef?.current?.focus()}
    // >
    <StyledEditor ref={containerElement}></StyledEditor>
    // </StyledFocusable>
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
