import { debounce } from "lodash";
import React, { useEffect } from "react";
import styled from "styled-components";
import { Section } from "../../shared/ui/app";
import { Ipc } from "../../shared/ipc";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";
import { EditorToolbar, TOOLBAR_HEIGHT } from "./EditorToolbar";
import { getNoteById } from "../../shared/domain/note";
import { Config } from "../../shared/domain/config";
import { ml3 } from "../css";

const NOTE_SAVE_INTERVAL_MS = 1000;

interface EditorProps {
  store: Store;
  config: Config;
}

export function Editor(props: EditorProps): JSX.Element {
  const { store, config } = props;
  const { state } = store;
  const { editor } = state;

  let activeTab;
  if (editor.activeTabNoteId != null) {
    activeTab = editor.tabs.find(t => t.note.id === editor.activeTabNoteId);
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.setModelViewState", setModelViewState);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.setModelViewState", setModelViewState);
    };
  }, [store]);

  let content;
  if (activeTab) {
    if (editor.isEditing) {
      content = <Monaco store={store} config={config} />;
    } else {
      content = (
        <Markdown
          store={store}
          content={activeTab.note.content}
          scroll={editor.scroll}
        />
      );
    }
  }

  return (
    <StyledFocusable
      store={store}
      section={Section.Editor}
      focusOnRender={false}
    >
      <EditorToolbar store={store} />
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
  height: calc(100% - ${TOOLBAR_HEIGHT});
  overflow: hidden;
  ${ml3}
`;

const debouncedInvoker = debounce(
  window.ipc,
  NOTE_SAVE_INTERVAL_MS,
) as unknown as Ipc;

// N.B. setContent and setViewState are stored in the parent Editor component
// instead of Monaco because they may be invoked after the Monaco component has
// been unmounted due to how we debounce / flush the debounced functions
// on unmount.

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

    if (prev.editor.tabs[index].isNewNote) {
      delete prev.editor.tabs[index].isNewNote;
    }
    if (prev.editor.tabs[index].isPreview) {
      delete prev.editor.tabs[index].isPreview;
    }

    return {
      editor: {
        tabs: [...prev.editor.tabs],
      },
    };
  });

  // TODO: Reduce the amount of work here. `getNoteById` flattens the entire
  // note tree then searches for the note in the resulting array. It works fine
  // for a limited number of notes but will eventually bottle neck.
  ctx.setNotes(notes => {
    const note = getNoteById(notes, noteId);
    note.content = content;
    return [...notes];
  });

  await debouncedInvoker("notes.update", noteId, { content });
};

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
