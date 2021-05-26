import { KeyCode, Shortcut } from '@/directives/shortcut';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: []
};

export const DEFAULT_SHORCUTS: ReadonlyArray<Shortcut> = [
    new Shortcut('escape', [KeyCode.Escape]),
    new Shortcut('editorSaveTab', [KeyCode.Control, KeyCode.LetterS]),
    new Shortcut('editorToggleEditMode', [KeyCode.Control, KeyCode.LetterE])
];
