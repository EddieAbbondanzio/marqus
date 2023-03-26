import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { Listener, Store } from "../store";
import * as monaco from "monaco-editor";
import { TOOLBAR_HEIGHT } from "./EditorToolbar";
import { Section } from "../../shared/ui/app";
import { Attachment, Protocol } from "../../shared/domain/protocols";
import { Config } from "../../shared/domain/config";

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
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const onChangeSub = useRef<monaco.IDisposable[]>([]);
  const activeNoteId = useRef<string | null>(null);

  // Need to sub before doing anything or else we get no listener error.
  useEffect(() => {
    store.on("editor.boldSelectedText", boldSelectedText);
    store.on("editor.italicSelectedText", italicSelectedText);
    store.on("editor.setModelViewState", setModelViewState);

    return () => {
      store.off("editor.boldSelectedText", boldSelectedText);
      store.off("editor.italicSelectedText", italicSelectedText);
      store.off("editor.setModelViewState", setModelViewState);
    };
  }, [store]);

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
        monacoEditor.current?.focus();
        wasFocused.current = true;
      }
    } else {
      wasFocused.current = false;
    }
  }, [focused]);

  // dragenter and dragover have to be cancelled in order for the drop event
  // to work on a div.
  const dragEnter = (ev: DragEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  };
  const dragOver = (ev: DragEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
  };
  const importAttachments = useCallback(
    async (ev: DragEvent) => {
      ev.preventDefault();

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

      // Use code below to insert the text:
      const { current: monaco } = monacoEditor;
      if (monaco != null) {
        const model = monaco.getModel();
        if (model == null) {
          return;
        }

        // When inserting attachments, we should move the content to the next
        // line if the current line already has content.
        let prefixWithEOL = false;
        const cursorPos = monaco.getPosition();
        if (cursorPos) {
          const lineLength = model.getLineLength(cursorPos.lineNumber);
          if (lineLength > 0) {
            prefixWithEOL = true;
          }
        }

        const eol = model.getEOL();
        let text = attachments.map(generateAttachmentLink).join(eol);
        if (prefixWithEOL) {
          text = eol + text;
        }

        monaco.trigger("keyboard", "type", {
          text,
        });
      }
    },
    [store.state],
  );

  // Mount / Unmount
  useEffect(() => {
    const { current: el } = containerElement;
    let resizeObserver: ResizeObserver | null = null;

    if (el != null) {
      monacoEditor.current = monaco.editor.create(el, {
        value: "",
        ...MONACO_SETTINGS,
        tabSize: config.tabSize,
      });

      // Disable default shortcut for ctrl+i so we can support italics.
      if (monacoEditor.current != null) {
        disableKeybinding(monacoEditor.current, "editor.action.triggerSuggest");
      }

      // Monaco doesn't automatically resize when it's container element does so
      // we need to listen for changes and trigger the refresh ourselves.

      resizeObserver = new ResizeObserver(() => {
        if (monacoEditor.current != null) {
          monacoEditor.current.layout();
        }
      });
      resizeObserver.observe(el);

      el.addEventListener("dragenter", dragEnter);
      el.addEventListener("dragover", dragOver);
      el.addEventListener("drop", importAttachments);
    }

    return () => {
      resizeObserver?.disconnect();

      if (monacoEditor.current != null) {
        monacoEditor.current.dispose();
        monacoEditor.current = null;
      }

      for (const sub of onChangeSub.current) {
        sub.dispose();
      }
      onChangeSub.current = [];

      if (el != null) {
        el.removeEventListener("dragenter", dragEnter);
        el.removeEventListener("dragover", dragOver);
        el.removeEventListener("drop", importAttachments);
      }
    };
    // No dependencies because we want this hook to only run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onModelChange = useCallback(async () => {
    if (monacoEditor.current == null) {
      return;
    }
    const value = monacoEditor.current.getModel()?.getValue();
    if (value == null) {
      return;
    }

    if (activeNoteId.current == null) {
      return;
    }

    const viewState = monacoEditor.current.saveViewState()!;
    const model = monacoEditor.current.getModel()!;
    await store.dispatch("editor.setModelViewState", {
      noteId: activeNoteId.current,
      modelViewState: {
        model,
        viewState,
      },
    });

    await store.dispatch("editor.setContent", {
      content: value,
      noteId: activeNoteId.current!,
    });
  }, [store]);

  const onViewStateChange = useCallback(() => {
    if (monacoEditor.current == null) {
      return;
    }
    if (activeNoteId.current == null) {
      return;
    }

    const viewState = monacoEditor.current.saveViewState()!;
    console.log(
      "View state change. Curr cursor:",
      viewState.cursorState[0].position,
    );
    store.dispatch("editor.setModelViewState", {
      noteId: activeNoteId.current,
      modelViewState: {
        viewState,
      },
    });
  }, [store]);

  // Subscribe to monaco editor events
  useEffect(() => {
    if (monacoEditor.current == null) {
      return;
    }

    // Prevent memory leak
    for (const sub of onChangeSub.current) {
      sub.dispose();
    }
    onChangeSub.current = [
      monacoEditor.current.onDidChangeModelContent(onModelChange),
      monacoEditor.current.onDidChangeCursorPosition(onViewStateChange),
      monacoEditor.current.onDidChangeCursorSelection(onViewStateChange),
      monacoEditor.current.onDidScrollChange(onViewStateChange),
    ];
  }, [onModelChange, onViewStateChange]);

  // Active tab change
  useEffect(() => {
    const lastActiveTabNoteId = activeNoteId.current;

    if (monacoEditor.current == null) {
      return;
    }

    // Load new model when switching to a new tab (either no previous tab, or the
    // new active tab is different).
    if (
      editor.activeTabNoteId != null &&
      (lastActiveTabNoteId == null ||
        lastActiveTabNoteId !== editor.activeTabNoteId)
    ) {
      const newTab = editor.tabs.find(
        t => t.note.id === editor.activeTabNoteId,
      );
      if (newTab == null) {
        throw new Error(`Active tab ${editor.activeTabNoteId} was not found.`);
      }

      const cache = store.cache.modelViewStates[newTab.note.id] ?? {};

      // First load, or model was disposed.
      if (cache.model == null || cache.model.isDisposed()) {
        cache.model = createMarkdownModel(newTab.note.content);

        store.dispatch("editor.setModelViewState", {
          noteId: newTab.note.id,
          modelViewState: cache,
        });
      }

      monacoEditor.current.setModel(cache.model);

      if (cache.viewState) {
        monacoEditor.current.restoreViewState(cache.viewState);
      } else {
        monacoEditor.current.restoreViewState(null);
      }

      if (state.focused[0] === Section.Editor) {
        monacoEditor.current.focus();
      }

      activeNoteId.current = newTab.note.id;
    }
  }, [editor.activeTabNoteId, editor.tabs, state.focused, props, store]);

  const boldSelectedText: Listener<"editor.boldSelectedText"> = async () => {
    const editor = monacoEditor.current;
    if (editor != null) {
      wrapSelections(editor, "**");
    }
  };

  const italicSelectedText: Listener<
    "editor.italicSelectedText"
  > = async () => {
    const editor = monacoEditor.current;
    if (editor != null) {
      wrapSelections(editor, "_");
    }
  };

  return (
    <StyledEditor
      data-testid="monaco-container"
      ref={containerElement}
    ></StyledEditor>
  );
}

const StyledEditor = styled.div`
  flex-grow: 1;
  height: calc(100% - ${TOOLBAR_HEIGHT});
`;

export function createMarkdownModel(
  content: string | undefined,
): monaco.editor.ITextModel {
  return monaco.editor.createModel(
    content ?? "",
    // N.B. Language needs to be specified for syntax highlighting.
    "markdown",
  );
}

export function generateAttachmentLink(attachment: Attachment): string {
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

export function disableKeybinding(
  editor: monaco.editor.IStandaloneCodeEditor,
  commandId: string,
): void {
  // See: https://github.com/microsoft/monaco-editor/issues/102
  const { _standaloneKeybindingService } = editor as any;

  _standaloneKeybindingService.addDynamicKeybinding(
    `-${commandId}`,
    undefined,
    () => void undefined,
  );
}

export const setModelViewState: Listener<"editor.setModelViewState"> = (
  { value },
  ctx,
) => {
  // TODO: Can we make listener parameters required?
  if (value == null || value.noteId == null || value.modelViewState == null) {
    return;
  }

  ctx.setCache({
    modelViewStates: {
      [value.noteId]: value.modelViewState,
    },
  });
};
