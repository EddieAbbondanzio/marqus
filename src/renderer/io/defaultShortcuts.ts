import { Shortcut } from ".";
import { KeyCode } from "./keyCode";

export const COMMON_KEY_COMBOS: Record<string, KeyCode[]> = {
  scrollDown: [KeyCode.Control, KeyCode.ArrowDown],
  scrollUp: [KeyCode.Control, KeyCode.ArrowUp],
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
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
];
