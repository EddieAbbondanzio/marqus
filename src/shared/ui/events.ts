import { Point } from "electron";
import { NoteSort } from "../domain/note";
import { Section } from "./app";

/*
 * Events are defined in shared so we can keep shortcuts and application menus
 * type safe.
 */
export interface UIEvents {
  // N.B. Don't send state objects as event parameters! The data could be stale
  // so we'd have to call ctx.getState() to get the latest version anyways.

  // Global
  "app.quit": void;
  "app.openDataDirectory": void;
  "app.selectDataDirectory": void;
  "app.openDevTools": void;
  "app.reload": void;
  "app.toggleFullScreen": void;
  "app.inspectElement": Point;
  "app.toggleSidebar": void;
  "app.openLogDirectory": void;

  // Sidebar
  "sidebar.updateScroll": number;
  "sidebar.scrollDown": void;
  "sidebar.scrollUp": void;
  "sidebar.resizeWidth": string;
  "sidebar.toggleFilter": void;
  "sidebar.createNote": string | null;
  "sidebar.renameNote": string;
  "sidebar.dragNote": { note: string; newParent?: string };
  "sidebar.deleteNote": string;
  "sidebar.moveNoteToTrash": string;
  "sidebar.setSelection": string[];
  "sidebar.clearSelection": void;
  "sidebar.collapseAll": void;
  "sidebar.expandAll": void;
  "sidebar.setNoteSort": { sort: NoteSort; note?: string };

  "sidebar.deleteSelectedNote": void;
  "sidebar.toggleItemExpanded": string;
  "sidebar.moveSelectionUp": void;
  "sidebar.moveSelectionDown": void;
  "sidebar.setSearchString": string;
  "sidebar.focusSearch": void;

  // Editor
  "editor.save": void;
  "editor.toggleView": void;
  "editor.setContent": { noteId: string; content: string };
  "editor.updateScroll": number;
  "editor.openTab": { note: string | string[]; active?: string } | undefined;

  "editor.closeTab": string;
  "editor.closeAllTabs": void;
  "editor.closeTabsToLeft": string;
  "editor.closeTabsToRight": string;
  "editor.closeOtherTabs": string;

  "editor.previousTab": void;
  "editor.nextTab": void;
  "editor.updateTabsScroll": number;

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
  "app.openDataDirectory",
  "app.selectDataDirectory",
  "app.openDevTools",
  "app.reload",
  "app.toggleFullScreen",
  "app.inspectElement",
  "app.toggleSidebar",
  "app.openLogDirectory",

  // Sidebar
  "sidebar.updateScroll",
  "sidebar.scrollDown",
  "sidebar.scrollUp",
  "sidebar.resizeWidth",
  "sidebar.toggleFilter",
  "sidebar.createNote",
  "sidebar.renameNote",
  "sidebar.dragNote",
  "sidebar.deleteNote",
  "sidebar.moveNoteToTrash",
  "sidebar.setSelection",
  "sidebar.clearSelection",
  "sidebar.collapseAll",
  "sidebar.expandAll",
  "sidebar.setNoteSort",
  "sidebar.deleteSelectedNote",
  "sidebar.toggleItemExpanded",
  "sidebar.moveSelectionUp",
  "sidebar.moveSelectionDown",
  "sidebar.setSearchString",
  "sidebar.focusSearch",

  // Editor
  "editor.save",
  "editor.toggleView",
  "editor.setContent",
  "editor.updateScroll",
  "editor.openTab",
  "editor.closeTab",
  "editor.closeAllTabs",
  "editor.closeTabsToLeft",
  "editor.closeTabsToRight",
  "editor.closeOtherTabs",
  "editor.previousTab",
  "editor.nextTab",
  "editor.updateTabsScroll",

  // Focus Tracker
  "focus.push",
  "focus.pop",

  // Context Menu
  "contextMenu.blur",
  "contextMenu.run",
  "contextMenu.moveSelectionUp",
  "contextMenu.moveSelectionDown",
];
