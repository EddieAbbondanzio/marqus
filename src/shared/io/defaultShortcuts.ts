import { Shortcut } from "../state";
import { KeyCode, sortKeyCodes } from "./keyCode";

export const COMMON_KEY_COMBOS: Record<string, KeyCode[]> = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

const shortcuts: Shortcut[] = [
  {
    command: "globalNavigation.scrollDown",
    keys: COMMON_KEY_COMBOS.scrollDown,
    when: "globalNavigation",
    repeat: true,
  },
  {
    command: "globalNavigation.scrollUp",
    keys: COMMON_KEY_COMBOS.scrollUp,
    when: "globalNavigation",
    repeat: true,
  },
  {
    command: "globalNavigation.createTag",
    keys: [KeyCode.Control, KeyCode.LetterT],
    when: "globalNavigation",
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
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sortKeyCodes(s.keys),
}));
