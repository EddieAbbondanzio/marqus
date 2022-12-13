import {
  faEdit,
  faFile,
  faPaperclip,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import { getNoteById, getNoteByPath } from "../../shared/domain/note";
import { m0, mr2, my2, p2, px2, rounded, THEME } from "../css";
import { Listener, Store } from "../store";
import { Icon } from "./shared/Icon";
import { orderBy } from "lodash";
import { Section } from "../../shared/ui/app";
import { Scrollable } from "./shared/Scrollable";
import { Focusable } from "./shared/Focusable";
import { arrayify } from "../../shared/utils";
import { isProtocolUrl } from "../../shared/domain/protocols";
import OpenColor from "open-color";
import { deleteNoteIfConfirmed } from "../utils/deleteNoteIfConfirmed";

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

    const onClick = async (noteId: string) => {
      await store.dispatch("editor.openTab", { note: noteId, active: noteId });
    };

    const onClose = async () => {
      await store.dispatch("editor.closeTab", undefined!);
    };

    for (const tab of editor.tabs) {
      const note = getNoteById(notes, tab.note.id);

      rendered.push(
        <EditorTab
          key={note.id}
          noteId={note.id}
          noteName={note.name}
          active={activeTabNoteId === note.id}
          onClick={onClick}
          onClose={onClose}
        />,
      );
    }

    return rendered;
  }, [notes, editor, store]);

  const [previousTab, nextTab] = useMemo(() => {
    // Don't bother allowing switching tabs if there's no active tab, or there's
    // only 1 tab currently active since it'd be a no-op.
    if (editor.activeTabNoteId == null || editor.tabs.length <= 1) {
      return [null, null];
    }

    const tabsByLastActive = orderBy(editor.tabs, ["lastActive"], ["desc"]);

    const currentIndex = tabsByLastActive.findIndex(
      t => t.note.id === editor.activeTabNoteId,
    );

    let previousIndex = (currentIndex - 1) % tabsByLastActive.length;

    // Need to wrap it around
    if (previousIndex < 0) {
      previousIndex = tabsByLastActive.length + previousIndex;
    }

    const nextIndex = Math.abs((currentIndex + 1) % tabsByLastActive.length);
    return [tabsByLastActive[previousIndex], tabsByLastActive[nextIndex]];
  }, [editor.tabs, editor.activeTabNoteId]);

  const switchToNextTab: Listener<"editor.nextTab"> = useCallback(
    (_, ctx) => {
      if (nextTab == null) {
        return;
      }

      ctx.setUI({
        editor: {
          activeTabNoteId: nextTab?.note.id,
        },
      });
    },
    [nextTab],
  );

  const switchToPreviousTab: Listener<"editor.previousTab"> = useCallback(
    (_, ctx) => {
      if (previousTab == null) {
        return;
      }

      ctx.setUI({
        editor: {
          activeTabNoteId: previousTab?.note.id,
        },
      });
    },
    [previousTab],
  );

  const closeTab: Listener<
    | "editor.closeActiveTab"
    | "editor.closeTab"
    | "editor.closeAllTabs"
    | "editor.closeOtherTabs"
    | "editor.closeTabsToLeft"
    | "editor.closeTabsToRight"
  > = async ({ type, value }, ctx) => {
    const { editor } = ctx.getState();
    if (editor.activeTabNoteId == null || editor.tabs.length === 0) {
      return;
    }

    let noteIdsToClose: string[] = [];

    switch (type) {
      case "editor.closeActiveTab":
        noteIdsToClose = [editor.activeTabNoteId];
        break;

      case "editor.closeTab":
        if (value == null) {
          return;
        }

        noteIdsToClose = [value];
        break;

      case "editor.closeAllTabs":
        noteIdsToClose = editor.tabs.map(t => t.note.id);
        break;

      case "editor.closeOtherTabs":
        noteIdsToClose = editor.tabs
          .filter(t => t.note.id !== (value ?? editor.activeTabNoteId))
          .map(t => t.note.id);
        break;

      case "editor.closeTabsToLeft": {
        const leftLimit = editor.tabs.findIndex(
          t => t.note.id === (value ?? editor.activeTabNoteId),
        );
        noteIdsToClose = editor.tabs.slice(0, leftLimit).map(t => t.note.id);
        break;
      }

      case "editor.closeTabsToRight": {
        const rightLimit = editor.tabs.findIndex(
          t => t.note.id === (value ?? editor.activeTabNoteId),
        );

        noteIdsToClose = editor.tabs.slice(rightLimit + 1).map(t => t.note.id);
        break;
      }

      default:
        throw new Error(`Invalid action ${value}`);
    }

    ctx.setUI(prev => {
      const tabs = prev.editor.tabs.filter(
        t => !noteIdsToClose.includes(t.note.id),
      );

      let activeTabNoteId: string | undefined;
      switch (type) {
        case "editor.closeAllTabs":
          activeTabNoteId = undefined;
          break;

        case "editor.closeTab":
        case "editor.closeActiveTab": {
          const [tabsByLastActive] = orderBy(tabs, ["lastActive"], ["desc"]);
          activeTabNoteId = tabsByLastActive?.note.id;
          break;
        }

        default:
          activeTabNoteId = prev.editor.activeTabNoteId;
      }

      let isEditing = prev.editor.isEditing;
      if (tabs.length === 0) {
        isEditing = false;
      }

      return {
        ...prev,
        editor: {
          activeTabNoteId,
          tabs,
          isEditing,
        },
      };
    });
  };

  const openAttachments = useCallback(async () => {
    const { activeTabNoteId } = store.state.editor;

    if (activeTabNoteId == null) {
      return;
    }

    await store.dispatch("app.openNoteAttachments", activeTabNoteId);
  }, [store]);

  useEffect(() => {
    store.on("editor.openTab", openTab);
    store.on(
      [
        "editor.closeActiveTab",
        "editor.closeTab",
        "editor.closeAllTabs",
        "editor.closeOtherTabs",
        "editor.closeTabsToLeft",
        "editor.closeTabsToRight",
      ],
      closeTab,
    );
    store.on("editor.nextTab", switchToNextTab);
    store.on("editor.previousTab", switchToPreviousTab);
    store.on("editor.updateTabsScroll", updateTabsScroll);
    store.on("editor.deleteNote", deleteNote);

    return () => {
      store.off("editor.openTab", openTab);
      store.off(
        [
          "editor.closeActiveTab",
          "editor.closeTab",
          "editor.closeAllTabs",
          "editor.closeOtherTabs",
          "editor.closeTabsToLeft",
          "editor.closeTabsToRight",
        ],
        closeTab,
      );
      store.off("editor.nextTab", switchToNextTab);
      store.off("editor.previousTab", switchToPreviousTab);
      store.off("editor.updateTabsScroll", updateTabsScroll);
      store.off("editor.deleteNote", deleteNote);
    };
  }, [store, switchToNextTab, switchToPreviousTab]);

  return (
    <StyledFocusable section={Section.EditorTabs} store={store}>
      <ButtonRow>
        <StyledButton
          title="Toggle edit/view mode"
          onClick={async () => await store.dispatch("editor.toggleView")}
          highlighted={store.state.editor.isEditing}
        >
          <Icon icon={faEdit} />
        </StyledButton>

        <StyledButton title="Open attachments" onClick={openAttachments}>
          <Icon icon={faPaperclip} />
        </StyledButton>

        <StyledButton
          title="Delete note"
          onClick={async () => await store.dispatch("editor.deleteNote")}
        >
          <Icon icon={faTrash} />
        </StyledButton>
      </ButtonRow>

      <StyledScrollable
        orientation="horizontal"
        scroll={editor.tabsScroll}
        onScroll={s => store.dispatch("editor.updateTabsScroll", s)}
      >
        {tabs}
      </StyledScrollable>
    </StyledFocusable>
  );
}

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 1.2rem;
  padding-right: 1.2rem;
`;

const StyledButton = styled.button<{ highlighted?: boolean }>`
  border: none;
  background-color: transparent;
  ${p2}
  ${rounded}
  font-size: 1.6rem;
  height: 2.9rem;
  margin-right: 0.2rem;

  i {
    color: ${p =>
      p.highlighted ? OpenColor.orange[7] : THEME.editor.tabs.activeTabFont};
  }

  &:hover {
    cursor: pointer;
    background-color: ${THEME.editor.tabs.hoveredButtonBackground}!important;
  }
`;

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${THEME.editor.tabs.border};
  width: 100%;
  background-color: ${THEME.editor.tabs.background};
`;

const StyledScrollable = styled(Scrollable)`
  width: calc(100% - 1rem) !important;
  white-space: nowrap;
  padding-left: 0.4rem;
  padding-right: 0.4rem;

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
    // Need to stop prop otherwise it'll trigger onClick of tab.
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
        <FlexRow>
          <StyledNoteIcon icon={faFile} size="lg" />
          <StyledSelectedText>{noteName}</StyledSelectedText>
        </FlexRow>
        <StyledDelete
          icon={faTimes}
          onClick={onDeleteClick}
          className="delete"
          title={`Close ${noteName}`}
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
        <FlexRow>
          <StyledNoteIcon icon={faFile} size="lg" />
          <StyledText>{noteName}</StyledText>
        </FlexRow>
        <StyledDelete
          icon={faTimes}
          onClick={onDeleteClick}
          className="delete"
          title={`Close ${noteName}`}
        />
      </StyledTab>
    );
  }
}

const StyledNoteIcon = styled(Icon)`
  margin-right: 1rem;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledTab = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 12rem;
  ${px2}
  ${my2}
  ${mr2}

  border-radius: 0.4rem;
  height: 2.6rem;

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
  border-radius: 0.4rem;
  ${p2}
  ${m0}

  &:hover {
    cursor: pointer;
    color: ${THEME.editor.tabs.deleteColor};
    background-color: ${THEME.editor.tabs.deleteHoverBackground};
  }
`;

export const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  // Keep in sync with sidebar.openSelectedNotes listener
  const { editor, notes } = ctx.getState();

  if (ev.value?.note == null) {
    return;
  }

  const notesToOpen = arrayify(ev.value.note);
  const noteIds: string[] = [];
  let activeTabNoteId;

  for (const note of notesToOpen) {
    if (isProtocolUrl("note", note)) {
      const foundNote = getNoteByPath(notes, note);
      noteIds.push(foundNote.id);
    } else {
      noteIds.push(note);
    }
  }

  const { active } = ev.value;
  if (active) {
    if (isProtocolUrl("note", active)) {
      activeTabNoteId = getNoteByPath(notes, active).id;
    } else {
      activeTabNoteId = active;
    }
  }

  if (noteIds.length === 0) {
    return;
  }

  const tabs = [...editor.tabs];

  for (const noteId of noteIds) {
    let newTab = false;
    let tab = editor.tabs.find(t => t.note.id === noteId);

    if (tab == null) {
      newTab = true;
      const note = getNoteById(notes, noteId);
      tab = { note };
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

  if (ev.value.focus) {
    ctx.focus([Section.Editor], { overwrite: true });
  }
};

export const deleteNote: Listener<"editor.deleteNote"> = async (_, ctx) => {
  const {
    editor: { activeTabNoteId },
  } = ctx.getState();
  if (activeTabNoteId == null) {
    return;
  }

  await deleteNoteIfConfirmed(ctx, activeTabNoteId);
};

export const updateTabsScroll: Listener<"editor.updateTabsScroll"> = async (
  { value: tabsScroll },
  ctx,
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
  const parent = element.closest(`[${EDITOR_TAB_ATTRIBUTE}]`);
  if (parent != null) {
    return parent.getAttribute(EDITOR_TAB_ATTRIBUTE);
  }

  return null;
}
