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

export function Monaco(props: MonacoProps): JSX.Element {
  const { store } = props;
  const { state } = store;

  // These are stored as refs because we don't want the component to re-render
  // if any of them change.
  const containerElement = useRef<HTMLDivElement | null>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeSub = useRef<monaco.IDisposable | null>(null);

  const [loadedNoteId, setloadedNoteId] = useState<string | null>(null);

  // A bit of a hack. But we need this to refocus the editor on each render.
  const focused = state.focused[0];
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
      // monacoEditor.current = monaco.editor.create(el, {
      //   value: editor.content ?? "",
      //   ...MONACO_SETTINGS,
      // });

      // Monaco doesn't automically resize when it's container element does so
      // we need to listen for changes and trigger the refresh ourselves.
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
    // No dependencies because we want this hook to only run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StyledEditor ref={containerElement}></StyledEditor>;
}

const StyledEditor = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;
