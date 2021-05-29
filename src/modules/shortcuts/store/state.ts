import { KeyCode } from '@/modules/shortcuts/common/key-code';
import { Shortcut } from '@/modules/shortcuts/common/shortcut';
import _ from 'lodash';

export interface ShortcutState {
    values: Shortcut[];
}

export const state: ShortcutState = {
    values: []
};
