import { KeyCode, Shortcut } from '@/directives/shortcut';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: []
};

export const DEFAULT_SHORCUTS: ReadonlyArray<Shortcut> = [
    new Shortcut('escape', [KeyCode.Escape]),
    new Shortcut('save', [KeyCode.Control, KeyCode.LetterS])
];
