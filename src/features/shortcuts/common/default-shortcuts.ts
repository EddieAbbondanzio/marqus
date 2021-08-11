import { focusManager } from '@/directives/focusable';
import { KeyCode } from '@/features/shortcuts/common/key-code';
import { Shortcut } from '@/features/shortcuts/common/shortcut';

function isFocused(section: string) {
    return () => focusManager.isFocused(section);
}

const up = [KeyCode.ArrowUp];
const down = [KeyCode.ArrowDown];

export const DEFAULT_SHORTCUTS: ReadonlyArray<Shortcut> = [
    new Shortcut('escape', [KeyCode.Escape]),
    new Shortcut('editorSave', [KeyCode.Control, KeyCode.LetterS]),
    new Shortcut('editorToggleMode', [KeyCode.Control, KeyCode.LetterE]),
    new Shortcut('editorToggleSplitView', [KeyCode.Control, KeyCode.Alt, KeyCode.LetterS]),
    new Shortcut('undo', [KeyCode.Control, KeyCode.LetterZ]),
    new Shortcut('redo', [KeyCode.Control, KeyCode.LetterY]),
    new Shortcut('globalNavigationMoveSelectionUp', up, isFocused('globalNavigation')),
    new Shortcut('globalNavigationMoveSelectionDown', down, isFocused('globalNavigation'))
];
