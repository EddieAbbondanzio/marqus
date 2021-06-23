import { KeyCode } from '@/features/shortcuts/common/key-code';
import { Shortcut } from '@/features/shortcuts/common/shortcut';
import _ from 'lodash';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: []
};
