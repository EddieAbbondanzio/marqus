import { DEFAULT_SHORTCUTS } from '@/features/shortcuts/common/default-shortcuts';
import { KeyCode } from '@/features/shortcuts/common/key-code';
import { Shortcut } from '@/features/shortcuts/common/shortcut';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import _ from 'lodash';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: Array.from(DEFAULT_SHORTCUTS)
};

// Needed for defaults in case no file was loaded.
shortcutManager.register(state.values);
