import { Point } from "electron";
import { Note, NoteSort } from "../domain/note";
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
  "editor.openTab": { note: string | string[]; active?: string };
  "editor.closeTab": string;
  "editor.previousTab": void;
  "editor.nextTab": void;
  "editor.setActiveTab": string;
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
