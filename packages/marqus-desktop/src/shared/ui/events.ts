import { Point } from "electron";
import { NoteSort } from "../domain/note";
import { ModelViewState, Section } from "./app";

/*
 * Events are defined in shared so we can keep shortcuts and application menus
 * type safe.
 */
export interface UIEvents {
  // N.B. Don't send state objects as event parameters! The data could be stale
  // so we'd have to call ctx.getState() to get the latest version anyways.

  // Global
  "app.quit": void;
  "app.openNoteDirectory": void;
  "app.selectNoteDirectory": void;
  "app.openDevTools": void;
  "app.reload": void;
  "app.toggleFullScreen": void;
  "app.inspectElement": Point;
  "app.toggleSidebar": void;
  "app.openLogDirectory": void;
  "app.openConfig": void;
  "app.openNoteAttachments": string;
  "app.toggleAutoHideAppMenu": void;

  // Sidebar
  "sidebar.updateScroll": number;
  "sidebar.scrollDown": void;
  "sidebar.scrollUp": void;
  "sidebar.resizeWidth": string;
  "sidebar.toggleFilter": void;
  "sidebar.createNote": { parent?: string | null } | { root?: true };
  "sidebar.renameNote": string;
  "sidebar.renameSelectedNote": void;
  "sidebar.dragNote": { note: string; newParent?: string };
  "sidebar.deleteNote": string;
  "sidebar.setSelection": string[];
  "sidebar.clearSelection": void;
  "sidebar.collapseAll": void;
  "sidebar.expandAll": void;
  "sidebar.setNoteSort": { sort: NoteSort; note?: string };

  "sidebar.deleteSelectedNote": void;
  "sidebar.toggleSelectedNoteExpanded": void;
  "sidebar.toggleNoteExpanded": string;
  "sidebar.moveSelectionUp": void;
  "sidebar.moveSelectionDown": void;
  "sidebar.search": string;
  "sidebar.focusSearch": void;
  "sidebar.selectSearchResult": string;
  "sidebar.moveSelectedSearchResultUp": void;
  "sidebar.moveSelectedSearchResultDown": void;
  "sidebar.openSelectedNotes": void;

  // Editor
  "editor.save": void;
  "editor.deleteNote": void;
  "editor.toggleView": void;
  "editor.setContent": { noteId: string; content: string };
  "editor.updateScroll": number;
  "editor.openTab":
    | { note: string | string[]; active?: string; focus?: boolean }
    | undefined;
  "editor.pinTab": string;
  "editor.unpinTab": string;
  "editor.closeActiveTab": string;
  "editor.closeTab": string;
  "editor.closeAllTabs": void;
  "editor.closeTabsToLeft": string;
  "editor.closeTabsToRight": string;
  "editor.closeOtherTabs": string;
  "editor.previousTab": void;
  "editor.nextTab": void;
  "editor.moveTab": { noteId: string; newIndex: number };
  "editor.updateTabsScroll": number;
  "editor.boldSelectedText": void;
  "editor.italicSelectedText": void;
  "editor.selectAllText": { isNewNote?: boolean };
  "editor.setModelViewState": {
    noteId: string;
    modelViewState: ModelViewState;
  };

  // Focus Tracker
  "focus.push": Section | Section[];
  "focus.pop": void;

  // Context Menu
  "contextMenu.blur": void;
  "contextMenu.run": void;
  "contextMenu.moveSelectionUp": void;
  "contextMenu.moveSelectionDown": void;
}

export type UIEventType = keyof UIEvents;
export type UIEventInput<Ev extends UIEventType> = UIEvents[Ev];

// Needed for validating user input. Kinda smelly but no easier way to get a list
// of the events at runtime.
export const LIST_OF_EVENTS: (keyof UIEvents)[] = [
  "app.quit",
  "app.openNoteDirectory",
  "app.selectNoteDirectory",
  "app.openDevTools",
  "app.reload",
  "app.toggleFullScreen",
  "app.inspectElement",
  "app.toggleSidebar",
  "app.openLogDirectory",
  "app.openConfig",
  "app.openNoteAttachments",
  "app.toggleAutoHideAppMenu",

  // Sidebar
  "sidebar.updateScroll",
  "sidebar.scrollDown",
  "sidebar.scrollUp",
  "sidebar.resizeWidth",
  "sidebar.toggleFilter",
  "sidebar.createNote",
  "sidebar.renameNote",
  "sidebar.renameSelectedNote",
  "sidebar.dragNote",
  "sidebar.deleteNote",
  "sidebar.setSelection",
  "sidebar.clearSelection",
  "sidebar.collapseAll",
  "sidebar.expandAll",
  "sidebar.setNoteSort",
  "sidebar.deleteSelectedNote",
  "sidebar.toggleSelectedNoteExpanded",
  "sidebar.toggleNoteExpanded",
  "sidebar.moveSelectionUp",
  "sidebar.moveSelectionDown",
  "sidebar.search",
  "sidebar.focusSearch",
  "sidebar.selectSearchResult",
  "sidebar.moveSelectedSearchResultUp",
  "sidebar.moveSelectedSearchResultDown",
  "sidebar.openSelectedNotes",

  // Editor
  "editor.save",
  "editor.deleteNote",
  "editor.toggleView",
  "editor.setContent",
  "editor.updateScroll",
  "editor.openTab",
  "editor.pinTab",
  "editor.unpinTab",
  "editor.closeTab",
  "editor.closeActiveTab",
  "editor.closeAllTabs",
  "editor.closeTabsToLeft",
  "editor.closeTabsToRight",
  "editor.closeOtherTabs",
  "editor.previousTab",
  "editor.nextTab",
  "editor.moveTab",
  "editor.updateTabsScroll",
  "editor.boldSelectedText",
  "editor.italicSelectedText",
  "editor.selectAllText",
  "editor.setModelViewState",

  // Focus Tracker
  "focus.push",
  "focus.pop",

  // Context Menu
  "contextMenu.blur",
  "contextMenu.run",
  "contextMenu.moveSelectionUp",
  "contextMenu.moveSelectionDown",
];
