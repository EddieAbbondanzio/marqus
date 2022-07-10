import { debounce, head, isEmpty, last, tail } from "lodash";
import React, { useEffect } from "react";
import styled from "styled-components";
import { EditorTab, Section } from "../../shared/ui/app";
import { Ipc } from "../../shared/ipc";
import { m2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";
import { getNoteById } from "../../shared/domain/note";
import { EditorTabs } from "./EditorTabs";
import * as monaco from "monaco-editor";

const NOTE_SAVE_INTERVAL_MS = 500;

interface EditorProps {
  store: Store;
}

export function Editor(props: EditorProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { editor } = state;

  let activeTab;
  if (editor.activeTabNoteId != null) {
    activeTab = editor.tabs.find((t) => t.noteId === editor.activeTabNoteId);
  }

  let content;
  if (state.editor.isEditting) {
    content = <Monaco store={store} />;
  } else {
    content = (
      <Markdown
        store={store}
        content={activeTab?.noteContent ?? ""}
        scroll={state.editor.scroll}
        onScroll={(newVal) =>
          void store.dispatch("editor.updateScroll", newVal)
        }
      />
    );
  }

  useEffect(() => {
    store.on("editor.setContent", setContent);
    store.on("editor.save", save);
    store.on("editor.toggleView", toggleView);
    store.on("editor.openTab", openTab);
    store.on("editor.updateScroll", updateScroll);
    store.on("editor.setActiveTab", setActiveTab);
    store.on("editor.closeTab", closeTab);

    return () => {
      store.off("editor.setContent", setContent);
      store.off("editor.save", save);
      store.off("editor.toggleView", toggleView);
      store.off("editor.openTab", openTab);
      store.off("editor.updateScroll", updateScroll);
      store.off("editor.setActiveTab", setActiveTab);
      store.off("editor.closeTab", closeTab);
    };
  }, [store]);

  return (
    <Focusable store={store} name={Section.Editor} focusOnRender={false}>
      <EditorTabs store={store} />
      <StyledContent>{content}</StyledContent>
    </Focusable>
  );
}

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${m2}
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL_MS) as Ipc;

const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  const { sidebar, editor } = ctx.getState();

  // If no note id was passed, we'll attempt to open the sidebar's selected note.
  let noteIds: string[];
  if (ev.value == null) {
    // User could accidentally press delete when nothing is selected so we
    // don't throw here.
    const { selected } = sidebar;
    if (isEmpty(selected)) {
      return;
    }

    noteIds = selected ?? [];
  } else {
    noteIds = Array.isArray(ev.value) ? ev.value : [ev.value];
  }

  if (noteIds.length === 0) {
    return;
  }

  let tabs = [...editor.tabs];

  for (const noteId of noteIds) {
    const tab: EditorTab = editor.tabs.find((t) => t.noteId === noteId) ?? {
      noteId,
      noteContent: undefined!,
    };

    if (tab.noteContent == null) {
      tab.noteContent = (await window.ipc("notes.loadContent", noteId)) ?? "";
    }

    if (tabs.findIndex((t) => t.noteId === noteId) === -1) {
      tabs.push(tab);
    }
  }

  ctx.setUI({
    editor: {
      activeTabNoteId: last(noteIds),
      tabs,
    },
  });

  // When the selected note is opened we need to change focus to the editor
  // because it means the user wants to start editting the note.
  if (ev.value == null) {
    ctx.focus([Section.Editor], { overwrite: true });
  }
};

const setActiveTab: Listener<"editor.setActiveTab"> = async (
  { value: noteId },
  ctx
) => {
  if (noteId == null) {
    return;
  }

  const { editor } = ctx.getState();
  if (editor.activeTabNoteId === noteId) {
    return;
  }

  ctx.setUI({
    editor: {
      activeTabNoteId: noteId,
    },
  });
};

const closeTab: Listener<"editor.closeTab"> = async (
  { value: noteId },
  ctx
) => {
  // If no note id was passed assume we want to close active tab
  if (noteId == null) {
    const {
      editor: { activeTabNoteId },
    } = ctx.getState();
    if (activeTabNoteId == null) {
      return;
    }

    noteId = activeTabNoteId;
  }

  const { editor } = ctx.getState();
  if (editor.tabs.every((t) => t.noteId !== noteId)) {
    throw new Error(`No tab for note ${noteId} found.`);
  }

  ctx.setUI((prev) => {
    let activeTabNoteId = prev.editor.activeTabNoteId;

    // Check if it was active tab
    if (activeTabNoteId != null && activeTabNoteId === noteId) {
      // TODO: Track tab changes as history so we can tab between them.
      activeTabNoteId = prev.editor.tabs[0]?.noteId ?? null;
    }

    return {
      ...prev,
      editor: {
        activeTabNoteId,
        tabs: prev.editor.tabs.filter((t) => t.noteId !== noteId),
      },
    };
  });
};

const setContent: Listener<"editor.setContent"> = async (
  { value: { noteId, content } },
  ctx
) => {
  ctx.setUI((prev) => {
    const index = prev.editor.tabs.findIndex(
      (t) => t.noteId === prev.editor.activeTabNoteId
    );
    // Update local cache for renderer
    prev.editor.tabs[index].noteContent = content;

    return {
      editor: {
        tabs: [...prev.editor.tabs],
      },
    };
  });

  await debouncedInvoker("notes.saveContent", noteId, content);
};

const toggleView: Listener<"editor.toggleView"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (editor.tabs == null || editor.tabs.length === 0) {
    return;
  }

  ctx.setUI({
    editor: {
      isEditting: !editor.isEditting,
    },
  });
};

const save: Listener<"editor.save"> = (_, ctx) => {
  const { editor } = ctx.getState();

  if (!editor.isEditting) {
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

export const updateScroll: Listener<"editor.updateScroll"> = (
  { value: scroll },
  ctx
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
