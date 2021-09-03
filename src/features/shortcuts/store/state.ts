import { DEFAULT_SHORTCUTS } from '@/features/shortcuts/shared/default-shortcuts';
import { KeyCode } from '@/features/shortcuts/shared/key-code';
import { Shortcut } from '@/features/shortcuts/shared/shortcut';
import _ from 'lodash';

export class ShortcutState {
    values: Shortcut[] = Array.from(DEFAULT_SHORTCUTS);
}
