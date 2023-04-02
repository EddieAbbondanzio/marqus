import {
  faEdit,
  faPaperclip,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  getFullPath,
  getNoteById,
  getNoteByPath,
  getParents,
} from "../../shared/domain/note";
import { p2, rounded, THEME } from "../css";
import { Listener, Store, StoreContext } from "../store";
import { Icon } from "./shared/Icon";
import { orderBy, uniq } from "lodash";
import { Section } from "../../shared/ui/app";
import { Scrollable } from "./shared/Scrollable";
import { Focusable } from "./shared/Focusable";
import { arrayify } from "../../shared/utils";
import { isProtocolUrl } from "../../shared/domain/protocols";
import OpenColor from "open-color";
import { deleteNoteIfConfirmed } from "../utils/deleteNoteIfConfirmed";
import { EditorTab } from "./EditorTab";

export const TOOLBAR_HEIGHT = "4.3rem"; // 4.2rem + 1px for border

export interface EditorToolbarProps {
  store: Store;
}

export function EditorToolbar(props: EditorToolbarProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { notes, editor } = state;

  const tabs = useMemo(() => {
    const rendered = [];
    const { activeTabNoteId } = editor;

    const onClick = async (noteId: string) => {
      await store.dispatch("editor.openTab", { note: noteId, active: noteId });
    };

    const onClose = async (noteId: string) => {
      await store.dispatch("editor.closeTab", noteId);
    };

    const onUnpin = async (noteId: string) => {
      await store.dispatch("editor.unpinTab", noteId);
    };

    // Put pinned tabs note first
    const sortedTabs = orderBy(editor.tabs, ["isPinned"], ["asc"]);
    for (const tab of sortedTabs) {
      const note = getNoteById(notes, tab.note.id);
      const notePath = getFullPath(notes, note);

      rendered.push(
        <EditorTab
          key={note.id}
          noteId={note.id}
          noteName={note.name}
          notePath={notePath}
          active={activeTabNoteId === note.id}
          isPinned={tab.isPinned}
          onClick={onClick}
          onClose={onClose}
          onUnpin={onUnpin}
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

      setActiveTab(ctx, nextTab.note.id);
    },
    [nextTab],
  );

  const switchToPreviousTab: Listener<"editor.previousTab"> = useCallback(
    (_, ctx) => {
      if (previousTab == null) {
        return;
      }

      setActiveTab(ctx, previousTab.note.id);
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
    store.on("editor.pinTab", pinTab);
    store.on("editor.unpinTab", unpinTab);

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
      store.off("editor.pinTab", pinTab);
      store.off("editor.unpinTab", unpinTab);
    };
  }, [store, switchToNextTab, switchToPreviousTab]);

  return (
    <EditorToolbarFocusable section={Section.EditorToolbar} store={store}>
      <ToolbarButtonRow>
        <ToolbarButton
          title="Toggle edit/view mode"
          onClick={async () => await store.dispatch("editor.toggleView")}
          highlighted={store.state.editor.isEditing}
        >
          <Icon icon={faEdit} />
        </ToolbarButton>

        <ToolbarButton title="Open attachments" onClick={openAttachments}>
          <Icon icon={faPaperclip} />
        </ToolbarButton>

        <ToolbarButton
          title="Delete note"
          onClick={async () => await store.dispatch("editor.deleteNote")}
        >
          <Icon icon={faTrash} />
        </ToolbarButton>
      </ToolbarButtonRow>

      <TabsScrollable
        orientation="horizontal"
        scroll={editor.tabsScroll}
        onScroll={s => store.dispatch("editor.updateTabsScroll", s)}
      >
        {tabs}
      </TabsScrollable>
    </EditorToolbarFocusable>
  );
}

const ToolbarButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
`;

const ToolbarButton = styled.button<{ highlighted?: boolean }>`
  border: none;
  background-color: transparent;
  ${p2}
  ${rounded}
  font-size: 1.6rem;
  height: 2.9rem;
  margin-right: 0.2rem;

  i {
    color: ${p =>
      p.highlighted ? OpenColor.orange[7] : THEME.editor.toolbar.buttonColor};
  }

  &:hover {
    cursor: pointer;
    background-color: ${THEME.editor.toolbar.hoveredButtonBackground}!important;
  }
`;

const EditorToolbarFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid ${THEME.editor.toolbar.border};
  width: 100%;
  background-color: ${THEME.editor.toolbar.background};
  height: 4.4rem;
`;

const TabsScrollable = styled(Scrollable)`
  width: calc(100% - 1rem) !important;
  white-space: nowrap;
  padding-left: 0.4rem;
  padding-right: 0.4rem;

  ::-webkit-scrollbar-thumb {
    background: ${THEME.editor.toolbar.scrollbarColor};
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
  let activeTabNoteId: string | undefined = undefined;

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
    },
  });

  setActiveTab(ctx, activeTabNoteId);

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

export const pinTab: Listener<"editor.pinTab"> = async (
  { value: tabNoteId },
  ctx,
) => {
  if (tabNoteId == null) {
    return;
  }

  const state = ctx.getState();
  if (state.editor.tabs.findIndex(t => t.note.id === tabNoteId) === -1) {
    return;
  }

  ctx.setUI(prev => {
    const tabs = prev.editor.tabs;
    const tab = tabs.find(t => t.note.id === tabNoteId)!;
    tab.isPinned = true;

    return prev;
  });
};

export const unpinTab: Listener<"editor.unpinTab"> = async (
  { value: tabNoteId },
  ctx,
) => {
  if (tabNoteId == null) {
    return;
  }

  const state = ctx.getState();
  if (state.editor.tabs.findIndex(t => t.note.id === tabNoteId) === -1) {
    return;
  }

  ctx.setUI(prev => {
    const tabs = prev.editor.tabs;
    const tab = tabs.find(t => t.note.id === tabNoteId)!;
    delete tab.isPinned;

    return prev;
  });
};

function setActiveTab(
  ctx: StoreContext,
  activeTabNoteId: string | undefined,
): void {
  const { sidebar, editor, notes } = ctx.getState();

  // When active tab changes, we select the note in the sidebar to make it easy
  // for the user to see what note they are working on. If the note is nested though
  // we need to expand parents to make sure it's visible.
  let { expanded = [] } = sidebar;
  if (activeTabNoteId != null && activeTabNoteId != editor.activeTabNoteId) {
    const activeNote = getNoteById(notes, activeTabNoteId!);
    const activeTabSidebarParents = getParents(activeNote, notes);

    if (activeTabSidebarParents.length > 0) {
      expanded = uniq([...expanded, ...activeTabSidebarParents.map(p => p.id)]);
    }
  }

  ctx.setUI({
    editor: {
      activeTabNoteId,
    },
    sidebar: {
      expanded,
      selected: [activeTabNoteId],
    },
  });
}
