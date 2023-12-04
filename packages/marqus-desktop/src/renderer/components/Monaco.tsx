import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { Listener, Store } from "../store";
import { Range } from "monaco-editor";
import * as monaco from "monaco-editor";
import { TOOLBAR_HEIGHT } from "./EditorToolbar";
import { Section } from "../../shared/ui/app";
import { Attachment, Protocol } from "../../shared/domain/protocols";
import { Config } from "../../shared/domain/config";
import { debounce } from "lodash";
import { useResizeObserver } from "../hooks/resizeObserver";
import {
  PatchedIStandaloneCodeEditor,
  createMarkdownModel,
  disableKeybinding,
} from "../utils/monaco";

const DEBOUNCE_INTERVAL_MS = 250;

// Fixes: Error: Language id "vs.editor.nullLanguage" is not configured nor known
// See https://github.com/microsoft/monaco-editor/issues/2962
monaco.languages.register({ id: "vs.editor.nullLanguage" });
monaco.languages.setLanguageConfiguration("vs.editor.nullLanguage", {});

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
  renderLineHighlight: "none",
};

export interface MonacoProps {
  store: Store;
  config: Config;
}

export function Monaco(props: MonacoProps): JSX.Element {
  const { store, config } = props;
  const { state } = store;
  const { editor } = state;

  // These are stored as refs because we don't want the component to re-render
  // if any of them change.
  const containerElement = useRef<HTMLDivElement | null>(null);
  const monacoEditor = useRef<PatchedIStandaloneCodeEditor>(null!);
  const onChangeSub = useRef<monaco.IDisposable[]>([]);
  const activeNoteId = useRef<string | null>(null);

  // Need to sub before doing anything or else we get no listener error.
  useEffect(() => {
    store.on("editor.boldSelectedText", boldSelectedText);
    store.on("editor.italicSelectedText", italicSelectedText);
    store.on("editor.selectAllText", selectAllText);

    return () => {
      store.off("editor.boldSelectedText", boldSelectedText);
      store.off("editor.italicSelectedText", italicSelectedText);
      store.off("editor.selectAllText", selectAllText);
    };
  }, [store]);

  // Mount / Unmount
  useEffect(() => {
    const dragEnter = () => {
      const { current: instance } = monacoEditor;
      const model = instance.getModel();
      if (!model) {
        return;
      }

      model.stopUndoRedoTracking();
    };

    const cancelDrop = () => {
      // Dragend doesn't fire when dropping files so we need to find another way
      // to detect if the file drop was cancelled. A file drop can be ended via
      // the user hitting the Escape key but we can't listen to this outside of
      // the window so we listen for the mouse to be released.

      const { current: instance } = monacoEditor;
      const model = instance.getModel();
      if (!model) {
        return;
      }

      model.resumeUndoRedoTracking();
    };

    const { current: el } = containerElement;
    if (el != null) {
      // TODO: Pull creating monaco instance out to a factory?
      const instance = monaco.editor.create(el, {
        value: "",
        ...MONACO_SETTINGS,
        tabSize: config.tabSize,
      }) as PatchedIStandaloneCodeEditor;
      monacoEditor.current = instance;

      // Disable default shortcut for ctrl+i so we can support italics.
      disableKeybinding(instance, "editor.action.triggerSuggest");

      el.addEventListener("dragenter", dragEnter);
      el.addEventListener("drop", importAttachments);
      window.addEventListener("mouseup", cancelDrop);
    }

    return () => {
      // Flush debounced handlers to ensure any final changes are made when the
      // editor switches to view mode.
      onViewStateChange.flush();
      onModelChange.flush();

      const { current: instance } = monacoEditor;
      instance.dispose();
      monacoEditor.current = null!;

      for (const sub of onChangeSub.current) {
        sub.dispose();
      }
      onChangeSub.current = [];

      if (el != null) {
        el.removeEventListener("dragenter", dragEnter);
        el.removeEventListener("drop", importAttachments);
        window.removeEventListener("mouseup", cancelDrop);
      }
    };
    // No dependencies because we want this hook to only run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // N.B. We need to manually focus the Monaco HTMLElement when the user switches
  // focus to the editor. We also need to make sure we don't re-apply focus once
  // already focused otherwise the ctrl+f popup breaks.
  const { focused } = state;
  const wasFocused = useRef<boolean>(false);

  useEffect(() => {
    if (focused.length === 0) {
      return;
    }

    if (focused[0] === Section.Editor) {
      if (!wasFocused.current) {
        const { current: instance } = monacoEditor;
        instance.focus();
        wasFocused.current = true;
      }
    } else {
      wasFocused.current = false;
    }
  }, [focused]);

  const importAttachments = useCallback(
    async (ev: DragEvent) => {
      if (ev.dataTransfer == null) {
        return;
      }

      const { files } = ev.dataTransfer;
      if (files.length === 0) {
        return;
      }

      const noteId = store.state.editor.activeTabNoteId;
      if (noteId == null) {
        return;
      }

      // N.B. When dragging and dropping files into Monaco the default behavior
      // is to paste the file path(s). This cannot be disabled. In order to get
      // around that, we have to hack things. We do this by:
      // 1. Pausing undo / redo tracking,
      // 2. Calculate how much text was pasted by Monaco
      // - Will be 1 full path per file, with a space between them if more than
      // - than 1 was passed.
      // 3. Execute an edit to remove all the chars in the range
      // 4. Turn undo / redo tracking back on.
      // 5. Paste our custom text. We turn on undo/redo tracking before this
      // - so it can be undone by the user if desired.
      // See: https://github.com/microsoft/monaco-editor/issues/100

      const { current: instance } = monacoEditor;
      const model = instance.getModel();
      if (model == null) {
        return;
      }

      // Cursor will always be set when dragging and dropping
      const dropPosition = instance.getPosition()!;
      const charsPasted = Object.values(files)
        .map(f => f.path)
        .join(" ").length;
      const initialDropPosition = dropPosition.delta(undefined, -charsPasted);

      // Undo path that was pasted
      const range = new Range(
        dropPosition.lineNumber,
        dropPosition.column,
        initialDropPosition.lineNumber,
        initialDropPosition.column,
      );
      instance.executeEdits("", [{ range, text: "" }]);

      const attachments = await window.ipc(
        "notes.importAttachments",
        noteId,
        // Can't send file objects over IPC so we map the important properties.
        Object.values(files).map(f => ({
          name: f.name,
          path: f.path,
          mimeType: f.type,
        })),
      );
      if (attachments.length === 0) {
        return;
      }

      model.resumeUndoRedoTracking();
      const text = attachments
        .map(generateAttachmentMarkdown)
        .join(model.getEOL());

      // N.B. We use executeEdits over trigger so if the user undoes the action
      // it'll remove ALL of the inserted attachment text at once.
      instance.executeEdits("", [
        {
          range: new Range(
            initialDropPosition.lineNumber,
            initialDropPosition.column,
            initialDropPosition.lineNumber,
            initialDropPosition.column,
          ),
          text,
        },
      ]);
    },
    [store.state],
  );

  // Monaco doesn't automatically resize when it's container element does so
  // we need to listen for changes and trigger the refresh ourselves.
  useResizeObserver(containerElement.current, () => {
    const { current: instance } = monacoEditor;
    instance.layout();
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onModelChange = useCallback(
    debounce(async () => {
      const { current: instance } = monacoEditor;

      const model = instance.getModel();
      if (model == null) {
        return;
      }

      if (activeNoteId.current == null) {
        return;
      }

      const viewState = instance.saveViewState()!;
      await store.dispatch("editor.setModelViewState", {
        noteId: activeNoteId.current,
        modelViewState: {
          model,
          viewState,
        },
      });

      await store.dispatch("editor.setContent", {
        content: model.getValue(),
        noteId: activeNoteId.current!,
      });
    }, DEBOUNCE_INTERVAL_MS),
    [store],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onViewStateChange = useCallback(
    debounce(() => {
      const { current: instance } = monacoEditor;
      const { current: noteId } = activeNoteId;

      if (instance == null || noteId == null) {
        return;
      }

      const viewState = instance.saveViewState()!;
      store.dispatch("editor.setModelViewState", {
        noteId,
        modelViewState: {
          viewState,
        },
      });
    }, DEBOUNCE_INTERVAL_MS),
    [store],
  );

  // Subscribe to monaco editor events
  useEffect(() => {
    const { current: instance } = monacoEditor;

    // Prevent memory leak
    for (const sub of onChangeSub.current) {
      sub.dispose();
    }
    onChangeSub.current = [
      instance.onDidChangeModelContent(onModelChange),
      instance.onDidChangeCursorPosition(onViewStateChange),
      instance.onDidChangeCursorSelection(onViewStateChange),
      instance.onDidScrollChange(onViewStateChange),
    ];
  }, [onModelChange, onViewStateChange]);

  // Active tab change
  useEffect(() => {
    const lastActiveTabNoteId = activeNoteId.current;

    // Load new model when switching to a new tab (either no previous tab, or the
    // new active tab is different).
    if (
      editor.activeTabNoteId != null &&
      (lastActiveTabNoteId == null ||
        lastActiveTabNoteId !== editor.activeTabNoteId)
    ) {
      (async () => {
        const { current: instance } = monacoEditor;
        if (instance == null) {
          return;
        }

        const newTab = editor.tabs.find(
          t => t.note.id === editor.activeTabNoteId,
        );
        if (newTab == null) {
          throw new Error(
            `Active tab ${editor.activeTabNoteId} was not found.`,
          );
        }

        activeNoteId.current = newTab.note.id;

        const cache = store.cache.modelViewStates[newTab.note.id] ?? {};
        if (cache.model == null || cache.model.isDisposed()) {
          // We need a way to inject custom stop / resume undoredo tracking
          cache.model = createMarkdownModel(newTab.note.content);

          await store.dispatch("editor.setModelViewState", {
            noteId: newTab.note.id,
            modelViewState: cache,
          });
        }

        // N.B. If the app locks up when we call setModel it means there's
        // something cloning the model via cloneDeep. (Double check store / deepUpdate)
        // Src: https://github.com/Microsoft/vscode/issues/72383
        instance.setModel(cache.model);
        instance.restoreViewState(cache.viewState ?? null);

        // On first open of a new note, select all it's text so user can easily
        // change the title if they wish.
        if (newTab.isNewNote && cache.viewState == null) {
          await store.dispatch("editor.selectAllText", { isNewNote: true });
        }

        if (state.focused[0] === Section.Editor) {
          instance.focus();
        }
      })();
    }
  }, [editor.activeTabNoteId, editor.tabs, state.focused, props, store]);

  const selectAllText: Listener<"editor.selectAllText"> = async ev => {
    const { current: instance } = monacoEditor;
    if (instance == null) {
      return;
    }

    let range = instance.getModel()!.getFullModelRange();

    // When we select all in a new note we only select the text in the title.
    if (ev.value && ev.value.isNewNote) {
      range = range.setStartPosition(1, 3);
    }

    instance.setSelection(range);
  };

  const boldSelectedText: Listener<"editor.boldSelectedText"> = async () => {
    const { current: instance } = monacoEditor;
    wrapSelections(instance, "**");
  };

  const italicSelectedText: Listener<
    "editor.italicSelectedText"
  > = async () => {
    const { current: instance } = monacoEditor;
    wrapSelections(instance, "_");
  };

  return (
    <StyledMonaco
      data-testid="monaco-container"
      ref={containerElement}
    ></StyledMonaco>
  );
}

const StyledMonaco = styled.div`
  flex-grow: 1;
  height: calc(100% - ${TOOLBAR_HEIGHT});
`;

export function generateAttachmentMarkdown(attachment: Attachment): string {
  // We do this to support spaces
  const urlEncodedPath = encodeURI(attachment.path);

  switch (attachment.type) {
    case "file":
      return `[${attachment.name}](${Protocol.Attachment}://${urlEncodedPath})`;
    case "image":
      return `![](${Protocol.Attachment}://${urlEncodedPath})`;
  }
}

export function wrapSelections(
  editor: monaco.editor.IStandaloneCodeEditor,
  wrapWith: string,
): void {
  for (const selection of editor.getSelections() ?? []) {
    const start = selection.getStartPosition();
    const end = selection.getEndPosition();

    // Don't wrap selection if it's empty.
    if (start.equals(end)) {
      continue;
    }

    editor.executeEdits(null, [
      {
        range: {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: start.lineNumber,
          endColumn: start.column,
        },
        text: wrapWith,
        forceMoveMarkers: true,
      },
      {
        range: {
          startLineNumber: end.lineNumber,
          startColumn: end.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column,
        },
        text: wrapWith,
        forceMoveMarkers: true,
      },
    ]);
  }
}
