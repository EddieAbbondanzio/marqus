import { Shortcut } from "../domain/shortcut";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS = {
  enter: [KeyCode.Enter],
  escape: [KeyCode.Escape],
  down: [KeyCode.ArrowDown],
  up: [KeyCode.ArrowUp],
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  // Global
  {
    event: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
  {
    event: "app.reload",
    keys: [KeyCode.Control, KeyCode.LetterR],
  },
  {
    event: "app.toggleFullScreen",
    keys: [KeyCode.F11],
  },

  // Sidebar
  {
    event: "sidebar.focus",
    keys: [KeyCode.Control, KeyCode.Digit1],
  },
  {
    event: "sidebar.toggle",
    keys: [KeyCode.Control, KeyCode.LetterB],
  },
  {
    event: "sidebar.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.moveSelectionUp",
    keys: COMMON_KEY_COMBOS.up,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.moveSelectionDown",
    keys: COMMON_KEY_COMBOS.down,
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.clearSelection",
    keys: COMMON_KEY_COMBOS.escape,
    when: "sidebar",
  },
  {
    event: "sidebar.createTag",
    keys: [KeyCode.Control, KeyCode.LetterT],
    when: "sidebar",
  },

  // Editor
  {
    event: "editor.focus",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },

  // Context Menu
  {
    event: "contextMenu.run",
    keys: COMMON_KEY_COMBOS.enter,
    when: "contextMenu",
  },
  {
    event: "contextMenu.blur",
    keys: COMMON_KEY_COMBOS.escape,
    when: "contextMenu",
  },
  {
    event: "contextMenu.moveSelectionDown",
    keys: COMMON_KEY_COMBOS.down,
    when: "contextMenu",
    repeat: true,
  },
  {
    event: "contextMenu.moveSelectionUp",
    keys: COMMON_KEY_COMBOS.up,
    when: "contextMenu",
    repeat: true,
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
