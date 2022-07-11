import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Store } from "../store";
import * as monaco from "monaco-editor";
import { TABS_HEIGHT } from "./EditorTabs";

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
  const { editor } = state;

  // These are stored as refs because we don't want the component to re-render
  // if any of them change.
  const containerElement = useRef<HTMLDivElement | null>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeSub = useRef<monaco.IDisposable | null>(null);
  const activeNoteId = useRef<string | null>(null);
  const viewStates = useRef<
    Record<string, monaco.editor.ICodeEditorViewState | null>
  >({});
  const models = useRef<Record<string, monaco.editor.IModel | null>>({});

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
      monacoEditor.current = monaco.editor.create(el, {
        value: "",
        ...MONACO_SETTINGS,
      });

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
      }

      if (onChangeSub.current != null) {
        onChangeSub.current.dispose();
      }
    };
    // No dependencies because we want this hook to only run once.
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

    store.dispatch("editor.setContent", {
      content: value,
      noteId: activeNoteId.current!,
    });
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

  // Active tab change
  useEffect(() => {
    const modelsCache = models.current;
    const viewStatesCache = viewStates.current;
    const lastActiveTabNoteId = activeNoteId.current;

    if (monacoEditor.current == null) {
      return;
    }

    // Cache off old state so we can restore it when tab is opened later on.
    if (lastActiveTabNoteId != null) {
      const oldTab = editor.tabs.find((t) => t.noteId === activeNoteId.current);

      // If old tab wasn't found, it means the tab was closed and we shouldn't
      // bother saving off view state / model.
      if (oldTab != null) {
        const viewState = monacoEditor.current.saveViewState();
        viewStatesCache[oldTab.noteId] = viewState;

        const model = monacoEditor.current.getModel();
        modelsCache[oldTab.noteId] = model;
      } else {
        modelsCache[lastActiveTabNoteId] = null;
        viewStatesCache[lastActiveTabNoteId] = null;
      }
    }

    // Load new tab
    if (editor.activeTabNoteId != null) {
      const newTab = editor.tabs.find(
        (t) => t.noteId === editor.activeTabNoteId
      );
      if (newTab == null) {
        throw new Error(`Active tab ${editor.activeTabNoteId} was not found.`);
      }

      let model = modelsCache[newTab.noteId];

      // First load, gotta create the model.
      if (model == null) {
        model = monaco.editor.createModel(newTab.noteContent);
      }

      monacoEditor.current.setModel(model);
      if (viewStatesCache[newTab.noteId] != null) {
        monacoEditor.current.restoreViewState(
          viewStates.current[newTab.noteId]!
        );
      }

      activeNoteId.current = newTab.noteId;
    }
  }, [editor.activeTabNoteId, editor.tabs]);

  return <StyledEditor ref={containerElement}></StyledEditor>;
}

const StyledEditor = styled.div`
  flex-grow: 1;
  height: calc(100% - ${TABS_HEIGHT});
`;
