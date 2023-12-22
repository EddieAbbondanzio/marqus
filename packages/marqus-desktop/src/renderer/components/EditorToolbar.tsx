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
import { clamp, orderBy, uniq, uniqBy } from "lodash";
import { ClosedEditorTab, Section } from "../../shared/ui/app";
import { Scrollable } from "./shared/Scrollable";
import { Focusable } from "./shared/Focusable";
import { arrayify } from "../../shared/utils";
import { isProtocolUrl } from "../../shared/domain/protocols";
import OpenColor from "open-color";
import { deleteNoteIfConfirmed } from "../utils/deleteNoteIfConfirmed";
import { EditorSpacer, EditorTab, TabDrag } from "./EditorTab";
import { MouseButton } from "../io/mouse";

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

    const onDrag = async (noteId: string, drag: TabDrag) => {
      const tab = editor.tabs.find(t => t.note.id === noteId);
      if (tab == null) {
        throw new Error(`No tab for note ID: ${noteId} found.`);
      }
      let newIndex: number;

      // Validating where we'll move the note to based on if it's pinned or not
      // will be handled in the store listener so we can disregard if a note is
      // pinned or not here.

      switch (drag.type) {
        case "absolute":
          switch (drag.side) {
            case "left":
              newIndex = 0;
              break;

            case "right":
              newIndex = editor.tabs.length - 1;
              break;
          }
          break;

        case "relative": {
          const targetIndex = editor.tabs.findIndex(
            t => t.note.id === drag.noteId,
          );
          if (targetIndex === -1) {
            throw new Error(`No target tab for note ID: ${noteId} found.`);
          }

          newIndex = targetIndex;
          break;
        }
      }

      await store.dispatch("editor.moveTab", { noteId, newIndex });
    };

    // Put pinned tabs note first
    for (const tab of editor.tabs) {
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
          isPreview={tab.isPreview}
          onClick={onClick}
          onClose={onClose}
          onUnpin={onUnpin}
          onDrag={onDrag}
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
        noteIdsToClose = editor.tabs
          .filter(t => !t.isPinned)
          .map(t => t.note.id);
        break;

      case "editor.closeOtherTabs":
        noteIdsToClose = editor.tabs
          .filter(
            t => !t.isPinned && t.note.id !== (value ?? editor.activeTabNoteId),
          )
          .map(t => t.note.id);
        break;

      case "editor.closeTabsToLeft": {
        const start = editor.tabs.findIndex(t => !t.isPinned);

        const end = editor.tabs.findIndex(
          t => t.note.id === (value ?? editor.activeTabNoteId),
        );
        noteIdsToClose = editor.tabs.slice(start, end).map(t => t.note.id);
        break;
      }

      case "editor.closeTabsToRight": {
        const firstNonPinnedIndex = editor.tabs.findIndex(t => !t.isPinned);
        const activeTabIndex = editor.tabs.findIndex(
          t => t.note.id === (value ?? editor.activeTabNoteId),
        );

        const end = Math.max(firstNonPinnedIndex, activeTabIndex + 1);

        noteIdsToClose = editor.tabs.slice(end).map(t => t.note.id);
        break;
      }

      default:
        throw new Error(`Invalid action ${value}`);
    }

    ctx.setCache(prev => {
      const newlyClosedTabs: ClosedEditorTab[] = noteIdsToClose.map(noteId => {
        const previousIndex = editor.tabs.findIndex(t => t.note.id === noteId);

        return {
          noteId,
          previousIndex,
          isPreview: editor.tabs[previousIndex].isPreview,
        };
      });

      const closedTabs = [...newlyClosedTabs, ...prev.closedTabs];

      // Each tab can only be opened once so we remove duplicates to ensure we
      // don't let the user try to re-open a tab that's already been re-opened.
      const deduplicatedClosedTabs = uniqBy(closedTabs, t => t.noteId);

      return {
        closedTabs: deduplicatedClosedTabs,
      };
    });

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

  const onMouseUp = useCallback(
    async (ev: MouseEvent) => {
      switch (ev.button) {
        case MouseButton.Forward:
          await store.dispatch("editor.previousTab");
          break;
        case MouseButton.Back:
          await store.dispatch("editor.nextTab");
          break;
      }
    },
    [store],
  );

  useEffect(() => {
    store.on("editor.openTab", openTab);
    store.on("editor.reopenClosedTab", reopenClosedTab);
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
    store.on("editor.moveTab", moveTab);
    store.on("editor.revealTabNoteInSidebar", revealTabNoteInSidebar);

    window.addEventListener("mouseup", onMouseUp);

    return () => {
      store.off("editor.openTab", openTab);
      store.off("editor.reopenClosedTab", reopenClosedTab);
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
      store.off("editor.moveTab", moveTab);
      store.off("editor.revealTabNoteInSidebar", revealTabNoteInSidebar);

      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [store, switchToNextTab, switchToPreviousTab, onMouseUp]);

  return (
    <EditorToolbarFocusable section={Section.EditorToolbar} store={store}>
      <LeftSpacer side="left">
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
      </LeftSpacer>

      <TabsScrollable
        orientation="horizontal"
        scroll={editor.tabsScroll}
        onScroll={s => store.dispatch("editor.updateTabsScroll", s)}
      >
        {tabs}
        <RightSpacer side="right" />
      </TabsScrollable>
    </EditorToolbarFocusable>
  );
}

const LeftSpacer = styled(EditorSpacer)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1.4rem;
`;

const RightSpacer = styled(EditorSpacer)`
  flex-grow: 1;
  min-width: 0.4rem;
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
  display: flex;
  align-items: center;
  width: calc(100% - 1rem) !important;
  white-space: nowrap;

  ::-webkit-scrollbar-thumb {
    background: ${THEME.editor.toolbar.scrollbarColor};
  }
`;

export const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  // Keep in sync with sidebar.openSelectedNotes listener
  if (ev.value?.note == null) {
    return;
  }

  const { notes } = ctx.getState();
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

  openTabsForNotes(ctx, noteIds);

  setActiveTab(ctx, activeTabNoteId);

  if (ev.value.focus) {
    ctx.focus([Section.Editor], { overwrite: true });
  }

  if (ev.value.scrollTo) {
    ctx.setUI({
      sidebar: {
        scrollToNoteId: activeTabNoteId,
      },
    });
  }

  cleanupClosedTabsCache(ctx);
};

export const reopenClosedTab: Listener<"editor.reopenClosedTab"> = async (
  _,
  ctx,
) => {
  const { closedTabs } = ctx.getCache();
  if (closedTabs.length === 0) {
    return;
  }

  const { noteId, previousIndex, isPreview } = closedTabs[0];
  ctx.setCache(prev => {
    const closedTabs = prev.closedTabs.slice(1);

    return {
      closedTabs,
    };
  });

  const { notes, editor } = ctx.getState();

  // Sanity check to ensure we don't open a duplicate tab.
  if (editor.tabs.findIndex(t => t.note.id === noteId) !== -1) {
    return;
  }

  const note = getNoteById(notes, noteId);
  ctx.setUI(prev => {
    const { tabs } = prev.editor;

    const newIndex = Math.min(previousIndex, tabs.length);
    tabs.splice(newIndex, 0, { note, isPreview });

    return {
      editor: {
        tabs,
      },
    };
  });

  setActiveTab(ctx, noteId);
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

    return {
      editor: {
        tabs: orderBy(tabs, ["isPinned"], ["asc"]),
      },
    };
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

    return {
      editor: {
        tabs: orderBy(tabs, ["isPinned"], ["asc"]),
      },
    };
  });
};

export const moveTab: Listener<"editor.moveTab"> = async ({ value }, ctx) => {
  if (value == null || value.newIndex === -1) {
    return;
  }

  const { noteId, newIndex } = value;

  const { editor } = ctx.getState();
  const originalIndex = editor.tabs.findIndex(t => t.note.id === noteId);
  if (originalIndex === -1) {
    throw new Error(`No tab for note ID: ${noteId} found.`);
  }

  const clampedNewIndex = clamp(newIndex, 0, editor.tabs.length - 1);
  if (originalIndex === clampedNewIndex) {
    return;
  }

  const tab = editor.tabs[originalIndex]!;
  let validatedIndex: number;
  if (tab.isPinned) {
    validatedIndex = Math.min(
      clampedNewIndex,
      editor.tabs.findIndex(t => !t.isPinned) - 1,
    );
  } else {
    validatedIndex = Math.max(
      clampedNewIndex,
      editor.tabs.findIndex(t => !t.isPinned),
    );
  }

  if (originalIndex === validatedIndex) {
    return;
  }

  ctx.setUI(prev => {
    const tabs = prev.editor.tabs;
    const [tab] = tabs.splice(originalIndex, 1);

    tabs.splice(validatedIndex, 0, tab);

    return {
      editor: {
        tabs,
      },
    };
  });
};

export const revealTabNoteInSidebar: Listener<
  "editor.revealTabNoteInSidebar"
> = async ({ value }, ctx) => {
  if (value == null) {
    return;
  }

  // The note we want to show in the sidebar may be hidden due to a collapsed
  // parent so we expand any if needed.
  const { notes } = ctx.getState();
  const noteToReveal = getNoteById(notes, value);
  const noteToRevealParentIds = getParents(noteToReveal, notes).map(n => n.id);

  ctx.setUI(prev => {
    const prevExpanded = prev.sidebar.expanded ?? [];
    const newExpanded = uniq([...prevExpanded, ...noteToRevealParentIds]);

    return {
      sidebar: {
        selected: [noteToReveal.id],
        scrollToNoteId: value,
        expanded: newExpanded,
      },
    };
  });
};

export function openTabsForNotes(
  ctx: StoreContext,
  noteIds: string[],
  newActiveTabNoteId?: string,
): void {
  if (noteIds.length === 0) {
    return;
  }

  const { editor, notes } = ctx.getState();
  let tabs = [...editor.tabs];

  for (const noteId of noteIds) {
    let newTab = false;
    let tab = editor.tabs.find(t => t.note.id === noteId);

    if (tab == null) {
      newTab = true;
      const note = getNoteById(notes, noteId);
      tab = { note };

      // Only open tabs in preview mode if we opened a single tab.
      if (noteIds.length === 1) {
        tab.isPreview = true;

        // Only one preview tab can be open at once.
        tabs = tabs.filter(t => !t.isPreview);
      }
    }

    tab.lastActive = new Date();

    if (newTab) {
      tabs.push(tab);
    }
  }

  let { activeTabNoteId } = editor;
  if (newActiveTabNoteId) {
    activeTabNoteId = newActiveTabNoteId;
  }
  if (!activeTabNoteId) {
    activeTabNoteId = tabs[0].note.id;
  }

  ctx.setUI({
    editor: {
      tabs,
      activeTabNoteId,
    },
  });
}

export function setActiveTab(
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

export function cleanupClosedTabsCache(ctx: StoreContext): void {
  const { tabs } = ctx.getState().editor;

  // Filter out any closed tabs that have been reopened.
  ctx.setCache(prev => {
    const closedTabs = prev.closedTabs.filter(
      ct => !tabs.some(t => t.note.id === ct.noteId),
    );

    return {
      closedTabs,
    };
  });
}
