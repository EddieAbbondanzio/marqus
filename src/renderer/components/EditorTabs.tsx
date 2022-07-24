import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { getNoteById } from "../../shared/domain/note";
import { m0, mb2, mr2, mt3, my2, p2, pt2, px2, py2, THEME } from "../css";
import { Listener, Store } from "../store";
import { Icon } from "./shared/Icon";
import { first, isEmpty, last, orderBy } from "lodash";
import { Section } from "../../shared/ui/app";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { Scrollable } from "./shared/Scrollable";
import OpenColor from "open-color";
import { Focusable } from "./shared/Focusable";
import { findParent } from "../utils/findParent";

export const EDITOR_TAB_ATTRIBUTE = "data-editor-tab";
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
      store.dispatch("editor.closeTab", undefined!);
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
    // There's no sense in allowing a user to tab between tabs if there's no tabs
    // or only 1 tab.
    if (editor.tabs.length <= 1) {
      return [null, null];
    }

    const tabsByLastActive = orderBy(editor.tabs, ["lastActive"], ["desc"]);

    if (editor.activeTabNoteId == null) {
      return [null, null];
    }

    const currentIndex = tabsByLastActive.findIndex(
      (t) => t.noteId === editor.activeTabNoteId
    );

    let previousIndex = (currentIndex - 1) % tabsByLastActive.length;

    // Need to wrap it around
    if (previousIndex < 0) {
      previousIndex = tabsByLastActive.length + previousIndex;
    }

    const nextIndex = Math.abs((currentIndex + 1) % tabsByLastActive.length);
    return [tabsByLastActive[previousIndex], tabsByLastActive[nextIndex]];
  }, [editor.tabs, editor.activeTabNoteId]);

  const switchToNextTab: Listener<"editor.nextTab"> = (_, ctx) => {
    if (nextTab == null) {
      return;
    }

    ctx.setUI({
      editor: {
        activeTabNoteId: nextTab?.noteId,
      },
    });
  };

  const switchToPreviousTab: Listener<"editor.previousTab"> = (_, ctx) => {
    if (previousTab == null) {
      return;
    }

    ctx.setUI({
      editor: {
        activeTabNoteId: previousTab?.noteId,
      },
    });
  };

  const closeTab: Listener<
    | "editor.closeTab"
    | "editor.closeAllTabs"
    | "editor.closeOtherTabs"
    | "editor.closeTabsToLeft"
    | "editor.closeTabsToRight"
  > = async ({ type, value }, ctx) => {
    const { editor } = ctx.getState();

    let noteIdsToClose: string[] = [];

    switch (type) {
      case "editor.closeAllTabs":
        noteIdsToClose = editor.tabs.map((t) => t.noteId);
        break;

      case "editor.closeOtherTabs":
        noteIdsToClose = editor.tabs
          .filter((t) => t.noteId !== (value ?? editor.activeTabNoteId))
          .map((t) => t.noteId);
        break;

      case "editor.closeTab":
        if (value == null && editor.activeTabNoteId == null) {
          return;
        }

        noteIdsToClose = [value ?? editor.activeTabNoteId!];
        break;

      case "editor.closeTabsToLeft":
        const leftLimit = editor.tabs.findIndex(
          (t) => t.noteId === (value ?? editor.activeTabNoteId)
        );
        noteIdsToClose = editor.tabs.slice(0, leftLimit).map((t) => t.noteId);
        break;

      case "editor.closeTabsToRight":
        const rightLimit = editor.tabs.findIndex(
          (t) => t.noteId === (value ?? editor.activeTabNoteId)
        );

        noteIdsToClose = editor.tabs.slice(rightLimit + 1).map((t) => t.noteId);
        break;

      default:
        throw new Error(`Invalid action ${value}`);
    }

    ctx.setUI((prev) => {
      const tabs = prev.editor.tabs.filter(
        (t) => !noteIdsToClose.includes(t.noteId)
      );

      let activeTabNoteId: string | undefined;
      switch (type) {
        case "editor.closeAllTabs":
          activeTabNoteId = undefined;
          break;

        case "editor.closeTab":
          const tabsByLastActive = orderBy(
            editor.tabs.filter((t) => !noteIdsToClose.includes(t.noteId)),
            ["lastActive"],
            ["desc"]
          );

          activeTabNoteId = tabsByLastActive[0]?.noteId;
          break;

        default:
          activeTabNoteId = prev.editor.activeTabNoteId;
      }

      let isEditting = prev.editor.isEditting;
      if (tabs.length === 0) {
        isEditting = false;
      }

      return {
        ...prev,
        editor: {
          activeTabNoteId,
          tabs,
          isEditting,
        },
      };
    });
  };

  useEffect(() => {
    store.on("editor.openTab", openTab);
    store.on(
      [
        "editor.closeTab",
        "editor.closeAllTabs",
        "editor.closeOtherTabs",
        "editor.closeTabsToLeft",
        "editor.closeTabsToRight",
      ],
      closeTab
    );
    store.on("editor.nextTab", switchToNextTab);
    store.on("editor.previousTab", switchToPreviousTab);
    store.on("editor.updateTabsScroll", updateTabsScroll);

    return () => {
      store.off("editor.openTab", openTab);
      store.off(
        [
          "editor.closeTab",
          "editor.closeAllTabs",
          "editor.closeOtherTabs",
          "editor.closeTabsToLeft",
          "editor.closeTabsToRight",
        ],
        closeTab
      );
      store.off("editor.nextTab", switchToNextTab);
      store.off("editor.previousTab", switchToPreviousTab);
      store.off("editor.updateTabsScroll", updateTabsScroll);
    };
  }, [store]);

  return (
    <Focusable name={Section.EditorTabs} store={store}>
      <StyledScrollable
        orientation="horizontal"
        scroll={editor.tabsScroll}
        onScroll={(s) => store.dispatch("editor.updateTabsScroll", s)}
      >
        {tabs}
      </StyledScrollable>
    </Focusable>
  );
}

const StyledScrollable = styled(Scrollable)`
  ${px2}
  width: calc(100% - 1rem)!important;
  height: 4.2rem;
  white-space: nowrap;
  background-color: ${THEME.editor.tabs.background};
  border-bottom: 1px solid ${THEME.editor.tabs.border};

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
        {...{ [EDITOR_TAB_ATTRIBUTE]: noteId }}
      >
        <StyledSelectedText>{noteName}</StyledSelectedText>
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
        {...{ [EDITOR_TAB_ATTRIBUTE]: noteId }}
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
  ${my2}
  ${mr2}

  border-radius: 0.4rem;
  height: 3.2rem;

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

const StyledSelectedText = styled(StyledText)`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${THEME.editor.tabs.activeTabFont};
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

export function getEditorTabAttribute(element: HTMLElement): string | null {
  return findParent(element, (el) => el.hasAttribute(EDITOR_TAB_ATTRIBUTE), {
    matchValue: (el) => el.getAttribute(EDITOR_TAB_ATTRIBUTE),
  });
}
