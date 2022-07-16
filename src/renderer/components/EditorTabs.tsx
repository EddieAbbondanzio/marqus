import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { getNoteById } from "../../shared/domain/note";
import { m0, p2, pt2, px2, py2, THEME } from "../css";
import { Listener, Store } from "../store";
import { Icon } from "./shared/Icon";
import { first, isEmpty, last, orderBy } from "lodash";
import { Section } from "../../shared/ui/app";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { Scrollable } from "./shared/Scrollable";

export const TABS_HEIGHT = "4.3rem";

export interface EditorTabsProps {
  store: Store;
}

export function EditorTabs(props: EditorTabsProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { notes, editor } = state;

  const tabs = useMemo(() => {
    const rendered = [];
    const { activeTabNoteId } = editor;

    const onClick = (noteId: string) => {
      store.dispatch("editor.openTab", { note: noteId, active: noteId });
    };

    const onClose = (noteId: string) => {
      store.dispatch("editor.closeTab", noteId);
    };

    for (const tab of editor.tabs) {
      const note = getNoteById(notes, tab.noteId);

      rendered.push(
        <EditorTab
          key={note.id}
          noteId={note.id}
          noteName={note.name}
          active={activeTabNoteId === note.id}
          onClick={onClick}
          onClose={onClose}
        />
      );
    }

    return rendered;
  }, [notes, editor.tabs]);

  const [previousTab, nextTab] = useMemo(() => {
    const tabsByLastActive = orderBy(editor.tabs, ["lastActive"], ["desc"]);

    if (editor.activeTabNoteId == null) {
      return [null, null];
    }

    const currentIndex = tabsByLastActive.findIndex(
      (t) => t.noteId === editor.activeTabNoteId
    );

    const previousIndex = Math.abs(
      (currentIndex - 1) % tabsByLastActive.length
    );
    const nextIndex = Math.abs((currentIndex + 1) % tabsByLastActive.length);

    return [tabsByLastActive[previousIndex], tabsByLastActive[nextIndex]];
  }, [editor.tabs]);

  const switchToNextTab: Listener<"editor.nextTab"> = (_, ctx) => {
    ctx.setUI({
      editor: {
        activeTabNoteId: nextTab?.noteId,
      },
    });
  };

  const switchToPreviousTab: Listener<"editor.previousTab"> = (_, ctx) => {
    ctx.setUI({
      editor: {
        activeTabNoteId: previousTab?.noteId,
      },
    });
  };

  useEffect(() => {
    store.on("editor.openTab", openTab);
    store.on("editor.closeTab", closeTab);
    store.on("editor.nextTab", switchToNextTab);
    store.on("editor.previousTab", switchToPreviousTab);
    store.on("editor.updateTabsScroll", updateTabsScroll);

    return () => {
      store.off("editor.openTab", openTab);
      store.off("editor.closeTab", closeTab);
      store.off("editor.nextTab", switchToNextTab);
      store.off("editor.previousTab", switchToPreviousTab);
      store.off("editor.updateTabsScroll", updateTabsScroll);
    };
  }, [store]);

  return (
    <StyledScrollable
      orientation="horizontal"
      scroll={editor.tabsScroll}
      onScroll={(s) => store.dispatch("editor.updateTabsScroll", s)}
    >
      {tabs}
    </StyledScrollable>
  );
}

const StyledScrollable = styled(Scrollable)`
  height: 3.6rem;
  white-space: nowrap;
  background-color: ${THEME.editor.tabs.background};
  border-bottom: 1px solid ${THEME.editor.tabs.border};
  ${pt2}

  ::-webkit-scrollbar-thumb {
    background: ${THEME.editor.tabs.scrollbarColor};
  }
`;

export interface EditorTabProps {
  noteId: string;
  noteName: string;
  active?: boolean;
  onClick: (noteId: string) => void;
  onClose: (noteId: string) => void;
}

export function EditorTab(props: EditorTabProps): JSX.Element {
  const { noteId, noteName, active } = props;

  const onDeleteClick = (ev: React.MouseEvent<HTMLElement>) => {
    // Need to stop prop otherwise it'll trigger on click of tab.
    ev.stopPropagation();
    props.onClose(noteId);
  };

  if (active) {
    return (
      <StyledSelectedTab
        key={noteId}
        title={noteName}
        onClick={() => props.onClick(noteId)}
      >
        <StyledText>{noteName}</StyledText>
        <StyledDelete
          icon={faTimes}
          onClick={onDeleteClick}
          className="delete"
        />
      </StyledSelectedTab>
    );
  } else {
    return (
      <StyledTab
        key={noteId}
        title={noteName}
        onClick={() => props.onClick(noteId)}
      >
        <StyledText>{noteName}</StyledText>
        <StyledDelete
          icon={faTimes}
          onClick={onDeleteClick}
          className="delete"
        />
      </StyledTab>
    );
  }
}

const StyledTab = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 12rem;
  cursor: pointer;
  ${px2}
  ${py2}
  border-radius: 0.4rem;
  margin-right: 0.4rem;

  .delete {
    display: none;
  }

  &:hover {
    background-color: ${THEME.editor.tabs.hoveredTabBackground};

    .delete {
      display: block;
    }
  }
`;

const StyledSelectedTab = styled(StyledTab)`
  background-color: ${THEME.editor.tabs.activeTabBackground};
  color: ${THEME.editor.tabs.activeTabFont};

  .delete {
    display: block;
  }
`;

const StyledText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledDelete = styled(Icon)`
  color: ${THEME.editor.tabs.deleteColor};
  border-radius: 0.4rem;
  ${p2}
  ${m0}

  &:hover {
    cursor: pointer;
    background-color: ${THEME.editor.tabs.deleteHoverBackground};
  }
`;

export const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  const { sidebar, editor } = ctx.getState();

  let noteIds: string[];
  let activeTabNoteId;

  let input;
  if (ev.value != null) {
    input = ev.value;
  }

  // Determine tabs to open
  if (input == null) {
    noteIds = sidebar.selected ?? [];
    activeTabNoteId = first(sidebar.selected);
  } else {
    noteIds = Array.isArray(input.note) ? input.note : [input.note];
    activeTabNoteId = input.active ?? last(noteIds);
  }

  if (noteIds.length === 0) {
    return;
  }

  let tabs = [...editor.tabs];

  for (const noteId of noteIds) {
    let newTab = false;
    let tab = editor.tabs.find((t) => t.noteId === noteId);

    if (tab == null) {
      newTab = true;
      tab = { noteId };
    }

    if (tab.noteContent == null) {
      tab.noteContent = (await window.ipc("notes.loadContent", noteId)) ?? "";
    }
    tab.lastActive = new Date();

    if (newTab) {
      tabs.push(tab);
    }
  }

  ctx.setUI({
    editor: {
      tabs,
      activeTabNoteId,
    },
  });

  // When the selected note is opened we need to change focus to the editor
  // because it means the user wants to start editting the note.
  if (ev.value == null) {
    ctx.focus([Section.Editor], { overwrite: true });
  }
};

export const closeTab: Listener<"editor.closeTab"> = async (
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
      const lastActiveTab = orderBy(prev.editor.tabs, ["lastActive"], ["desc"]);
      activeTabNoteId = lastActiveTab[1]?.noteId;
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

export const updateTabsScroll: Listener<"editor.updateTabsScroll"> = async (
  { value: tabsScroll },
  ctx
) => {
  if (tabsScroll != null) {
    ctx.setUI({
      editor: {
        tabsScroll,
      },
    });
  }
};
