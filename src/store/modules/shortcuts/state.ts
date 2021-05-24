import { Shortcut } from '@/directives/shortcut';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: []
};
