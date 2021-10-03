import { KeyCode } from "./key-code";

export const GLOBAL_NAVIGATION_SHORTCUTS = {
  focusGlobalNavigation: [KeyCode.Control, KeyCode.Digit1],
  globalNavigationCreateNotebook: [KeyCode.Control, KeyCode.LetterN],
  globalNavigationCreateTag: [KeyCode.Control, KeyCode.LetterT],
  globalNavigationCollapseAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowUp],
  globalNavigationExpandAll: [KeyCode.Control, KeyCode.Shift, KeyCode.ArrowDown]
};
