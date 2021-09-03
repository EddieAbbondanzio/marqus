import { focusManager } from '@/directives/focusable/focus-manager';
import { KeyCode } from '@/features/shortcuts/shared/key-code';
import { Shortcut } from '@/features/shortcuts/shared/shortcut';

const isGlobalNavigationFocused = () => focusManager.isFocused('globalNavigation');

const up = [KeyCode.ArrowUp];
const down = [KeyCode.ArrowDown];

export const DEFAULT_SHORTCUTS: ReadonlyArray<Shortcut> = [
    new Shortcut('escape', [KeyCode.Escape]),
    new Shortcut('editorSave', [KeyCode.Control, KeyCode.LetterS]),
    new Shortcut('editorToggleMode', [KeyCode.Control, KeyCode.LetterE]),
    new Shortcut('editorToggleSplitView', [KeyCode.Control, KeyCode.Alt, KeyCode.LetterS]),
    new Shortcut('undo', [KeyCode.Control, KeyCode.LetterZ]),
    new Shortcut('redo', [KeyCode.Control, KeyCode.LetterY]),
    new Shortcut('toggleExpandCollapse', [KeyCode.Space]),
    new Shortcut('focusGlobalNavigation', [KeyCode.Control, KeyCode.Digit1]),
    new Shortcut('focusLocalNavigation', [KeyCode.Control, KeyCode.Digit2]),
    new Shortcut('focusEditor', [KeyCode.Control, KeyCode.Digit3]),
    new Shortcut('globalNavigationMoveHighlightUp', up, isGlobalNavigationFocused),
    new Shortcut('globalNavigationMoveHighlightDown', down, isGlobalNavigationFocused),
    new Shortcut('globalNavigationClearHighlight', [KeyCode.Escape], isGlobalNavigationFocused),
    new Shortcut('globalNavigationSetHighlightActive', [KeyCode.Enter], isGlobalNavigationFocused),
    new Shortcut('globalNavigationDeleteHighlightItem', [KeyCode.Delete], isGlobalNavigationFocused),
    new Shortcut('globalNavigationCreateNotebook', [KeyCode.Control, KeyCode.LetterN]),
    new Shortcut('globalNavigationCreateTag', [KeyCode.Control, KeyCode.LetterT]),
    new Shortcut('globalNavigationScrollUp', [KeyCode.Control, KeyCode.ArrowUp], isGlobalNavigationFocused),
    new Shortcut('globalNavigationScrollDown', [KeyCode.Control, KeyCode.ArrowDown], isGlobalNavigationFocused)
];
