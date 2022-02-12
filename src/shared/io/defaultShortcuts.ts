import { Shortcut } from "../domain/shortcut";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS: Record<string, KeyCode[]> = {
  escape: [KeyCode.Escape],
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
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
    keys: [KeyCode.ArrowUp],
    when: "sidebar",
    repeat: true,
  },
  {
    event: "sidebar.moveSelectionDown",
    keys: [KeyCode.ArrowDown],
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
  {
    event: "editor.focus",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
