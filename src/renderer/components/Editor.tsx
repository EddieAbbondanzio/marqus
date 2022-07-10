import { debounce, head, isEmpty } from "lodash";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { EditorTab, Section } from "../../shared/ui/app";
import { Ipc } from "../../shared/ipc";
import { w100, p2, m2, p1, px2, pl2 } from "../css";
import { Listener, Store } from "../store";
import { Markdown } from "./Markdown";
import { Monaco } from "./Monaco";
import { Focusable } from "./shared/Focusable";
import { getNoteById, Note } from "../../shared/domain/note";
import OpenColor from "open-color";
import { faCross, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./shared/Icon";
import { EditorTabs as EditorTabComp, EditorTabs } from "./EditorTabs";

const NOTE_SAVE_INTERVAL_MS = 500;

interface EditorProps {
  store: Store;
}

export function Editor(props: EditorProps): JSX.Element {
  const { store } = props;
  const { state } = store;

  let content;
  if (state.editor.isEditting) {
    content = <Monaco store={store} />;
  } else {
    content = (
      <Markdown
        store={store}
        content={""}
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
  ${m2}
`;

const debouncedInvoker = debounce(window.ipc, NOTE_SAVE_INTERVAL_MS) as Ipc;

const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  const { sidebar, editor, notes } = ctx.getState();

  // If no note id was passed, we'll attempt to open the sidebar's selected note.
  let noteId: string;
  if (ev.value == null) {
    // User could accidentally press delete when nothing is selected so we
    // don't throw here.
    const { selected } = sidebar;
    if (isEmpty(selected)) {
      return;
    }

    noteId = head(selected)!;
  } else {
    noteId = ev.value;
  }

  const existingTab = editor.tabs.find((t) => t.noteId === noteId);
  if (existingTab != null) {
    ctx.setUI({
      editor: {
        activeTabNoteId: existingTab.noteId,
      },
    });
  } else {
    const note = getNoteById(ctx.getState().notes, noteId);
    const newTab: EditorTab = {
      noteId,
    };
    ctx.setUI(({ editor }) => ({
      editor: {
        activeTabNoteId: note.id,
        tabs: [...editor.tabs, newTab],
      },
    }));
  }

  // Opened selected note, gotta override!
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
  if (noteId == null) {
    return;
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
      activeTabNoteId = prev.editor.tabs[0]?.noteId;
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
  { value: content },
  ctx
) => {
  const { editor } = ctx.getState();
  console.log("editor.setContent isn't hooked up!");
  // if (editor.noteId != null) {
  //   ctx.setUI({
  //     editor: {
  //       content,
  //     },
  //   });

  //   await debouncedInvoker("notes.saveContent", editor.noteId, content);
  // }
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
