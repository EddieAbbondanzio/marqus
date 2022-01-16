import { Shortcut } from "../domain/valueObjects";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS: Record<string, KeyCode[]> = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  {
    command: "sidebar.focus",
    keys: [KeyCode.Control, KeyCode.Digit1],
  },
  {
    command: "sidebar.toggle",
    keys: [KeyCode.Control, KeyCode.LetterB],
  },
  {
    command: "sidebar.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "sidebar",
    repeat: true,
  },
  {
    command: "sidebar.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "sidebar",
    repeat: true,
  },
  {
    command: "sidebar.moveSelectionUp",
    keys: [KeyCode.ArrowUp],
    when: "sidebar",
    repeat: true,
  },
  {
    command: "sidebar.moveSelectionDown",
    keys: [KeyCode.ArrowDown],
    when: "sidebar",
    repeat: true,
  },
  {
    command: "sidebar.createTag",
    keys: [KeyCode.Control, KeyCode.LetterT],
    when: "sidebar",
  },
  {
    command: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
  {
    command: "app.reload",
    keys: [KeyCode.Control, KeyCode.LetterR],
  },
  {
    command: "app.toggleFullScreen",
    keys: [KeyCode.F11],
  },
  {
    command: "editor.focus",
    keys: [KeyCode.Control, KeyCode.Digit2],
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
