import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { Section } from "../../shared/ui/app";
import { Ipc } from "../../shared/ipc";
import { m2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { ModelAndViewState, Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";
import { EditorTabs, TABS_HEIGHT } from "./EditorTabs";
import { getNoteById } from "../../shared/domain/note";

const NOTE_SAVE_INTERVAL_MS = 500;

interface EditorProps {
  store: Store;
}

export function Editor(props: EditorProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { editor } = state;

  // N.B. We cache the model and view state for monaco tabs here in the Editor
  // vs within the Monaco component because the Monaco component gets unmounted
  // when the editor switches to view mode so we'd lose tab states.
  const modelAndViewStateCache = useRef<Record<string, ModelAndViewState>>({});
  const updateCache = useCallback(
    (noteId: string, modelAndViewState: ModelAndViewState) => {
      modelAndViewStateCache.current[noteId] = modelAndViewState;
    },
    [],
  );
  const removeCache = useCallback((noteId: string) => {
    delete modelAndViewStateCache.current[noteId];
  }, []);

  let activeTab;
  if (editor.activeTabNoteId != null) {
    activeTab = editor.tabs.find(t => t.note.id === editor.activeTabNoteId);
  }

  let content;
  if (state.editor.isEditing) {
    content = (
      <Monaco
        store={store}
        modelAndViewStateCache={modelAndViewStateCache.current}
        updateCache={updateCache}
        removeCache={removeCache}
      />
    );
  } else if (activeTab != null) {
    content = (
      <Markdown
        noteId={activeTab.note.id}
        content={activeTab.note.content}
        scroll={state.editor.scroll}
        onScroll={newVal => void store.dispatch("editor.updateScroll", newVal)}
      />
    );
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.updateScroll", updateScroll);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.updateScroll", updateScroll);
    };
  }, [store]);

  return (
    <StyledFocusable store={store} name={Section.Editor} focusOnRender={false}>
      <EditorTabs store={store} />
      <StyledContent>{content}</StyledContent>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  flex-grow: 1;
  overflow-y: hidden;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - ${TABS_HEIGHT});
  ${m2}
  overflow: hidden;
`;

const debouncedInvoker = debounce(
  window.ipc,
  NOTE_SAVE_INTERVAL_MS,
) as unknown as Ipc;

const setContent: Listener<"editor.setContent"> = async ({ value }, ctx) => {
  if (value == null) {
    return;
  }

  const { noteId, content } = value;

  ctx.setUI(prev => {
    const index = prev.editor.tabs.findIndex(
      t => t.note.id === prev.editor.activeTabNoteId,
    );
    // Update local cache for renderer
    prev.editor.tabs[index].note.content = content;
    return {
      editor: {
        tabs: [...prev.editor.tabs],
      },
    };
  });

  ctx.setNotes(notes => {
    const note = getNoteById(notes, noteId);
    note.content = content;
    return [...notes];
  });

  await debouncedInvoker("notes.update", noteId, { content });
};

const toggleView: Listener<"editor.toggleView"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (editor.tabs == null || editor.tabs.length === 0) {
    return;
  }

  ctx.setUI({
    editor: {
      isEditing: !editor.isEditing,
    },
  });
};

const save: Listener<"editor.save"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (!editor.isEditing) {
    return;
  }

  /*
   * We don't actually do any saving within this listener. This is just a fake
   * save function for the user to change the app back to read view.
   */

  ctx.setUI({
    editor: {
      isEditing: false,
    },
  });
};

export const updateScroll: Listener<"editor.updateScroll"> = (
  { value: scroll },
  ctx,
) => {
  if (scroll == null) {
    throw Error();
  }

  ctx.setUI({
    editor: {
      scroll,
    },
  });
};
