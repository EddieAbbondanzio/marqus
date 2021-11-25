import { Shortcut } from "../domain";
import { KeyCode, sort } from "./keyCode";

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
    command: "app.openDevTools",
    keys: [KeyCode.Control, KeyCode.Shift, KeyCode.LetterI],
  },
];

export const DEFAULT_SHORTCUTS = shortcuts.map((s) => ({
  ...s,
  // Ensure keys are always in correct order
  keys: sort(s.keys),
}));
