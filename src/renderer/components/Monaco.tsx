import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Store } from "../store";
import * as monaco from "monaco-editor";

const MONACO_SETTINGS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: "markdown",

  // Hide line numbers
  lineNumbers: "off",
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,

  wordWrap: "on",
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  minimap: {
    enabled: false,
  },
  contextmenu: false,
  quickSuggestions: false,
};

export interface MonacoProps {
  store: Store;
}

export function Monaco({ store }: MonacoProps): JSX.Element {
  const {
    ui: { editor },
  } = store.state;

  // Monaco and onChangeSub are stored as refs because we don't want the
  // component to re-render if either of them change.
  const containerElement = useRef<HTMLDivElement | null>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeSub = useRef<monaco.IDisposable | null>(null);

  const [loadedNoteId, setloadedNoteId] = useState<string | null>(null);

  // A bit of a hack. But we need this to refocus the editor on each render.
  const focused = store.state.ui.focused[0];
  useEffect(() => {
    if (focused === "editor") {
      monacoEditor.current?.focus();
    }
  });

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

  return <StyledEditor ref={containerElement}></StyledEditor>;
}

const StyledEditor = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;
