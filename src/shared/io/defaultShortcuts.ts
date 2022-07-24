import { Shortcut } from "../domain/shortcut";
import { Section } from "../ui/app";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  // Global
  {
    name: "app.quit",
    event: "app.quit",
    keys: [KeyCode.Control, KeyCode.LetterQ],
  },
  {
    name: "app.openDevTools",
    event: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
  {
    name: "app.reload",
    event: "app.reload",
    keys: [KeyCode.Control, KeyCode.LetterR],
  },
  {
    name: "app.toggleFullScreen",
    event: "app.toggleFullScreen",
    keys: [KeyCode.F11],
  },
  {
    name: "notes.create",
    event: "sidebar.createNote",
    keys: [KeyCode.Control, KeyCode.LetterN],
  },

  // Sidebar
  {
    name: "sidebar.focus",
    event: "focus.push",
    eventInput: Section.Sidebar,
    keys: [KeyCode.Control, KeyCode.Digit1],
  },
  {
    name: "app.toggleSidebar",
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  },
  {
    name: "sidebar.focusSearch",
    event: "sidebar.focusSearch",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterF],
  },
  {
    name: "sidebar.scrollDown",
    event: "sidebar.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: Section.Sidebar,
    repeat: true,
  },
  {
    name: "sidebar.scrollUp",
    event: "sidebar.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: Section.Sidebar,
    repeat: true,
  },
  {
    name: "sidebar.moveSelectionUp",
    event: "sidebar.moveSelectionUp",
    keys: [KeyCode.ArrowUp],
    when: Section.Sidebar,
    repeat: true,
  },
  {
    name: "sidebar.moveSelectionDown",
    event: "sidebar.moveSelectionDown",
    keys: [KeyCode.ArrowDown],
    when: Section.Sidebar,
    repeat: true,
  },
  {
    name: "editor.openTab",
    event: "editor.openTab",
    keys: [KeyCode.Enter],
    when: Section.Sidebar,
  },
  {
    name: "sidebar.deleteSelectedNote",
    event: "sidebar.deleteSelectedNote",
    keys: [KeyCode.Delete],
    when: Section.Sidebar,
  },
  {
    name: "sidebar.clearSelection",
    event: "sidebar.clearSelection",
    keys: [KeyCode.Escape],
    when: Section.Sidebar,
  },
  {
    name: "sidebar.toggleItemExpanded",
    event: "sidebar.toggleItemExpanded",
    keys: [KeyCode.Space],
    when: Section.Sidebar,
  },

  // Editor
  {
    name: "editor.focus",
    event: "focus.push",
    eventInput: "editor",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },
  {
    name: "editor.save",
    event: "editor.save",
    keys: [KeyCode.Control, KeyCode.LetterS],
  },
  {
    name: "editor.toggleView",
    event: "editor.toggleView",
    keys: [KeyCode.Control, KeyCode.LetterE],
  },
  {
    name: "editor.closeTab",
    event: "editor.closeTab",
    eventInput: { action: "self"},
    keys: [KeyCode.Control, KeyCode.LetterW],
    when: Section.Editor,
  },
  {
    name: "editor.closeAllTabs",
    event: "editor.closeTab",
    eventInput: { action: "all"},
    keys: [KeyCode.Control, KeyCode.Alt, KeyCode.LetterW],
    when: Section.Editor
  }
  {
    name: "editor.previousTab",
    event: "editor.previousTab",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.Tab],
  },
  {
    name: "editor.nextTab",
    event: "editor.nextTab",
    keys: [KeyCode.Control, KeyCode.Tab],
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
