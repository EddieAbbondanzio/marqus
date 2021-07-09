import { DEFAULT_SHORTCUTS } from '@/features/shortcuts/common/default-shortcuts';
import { KeyCode } from '@/features/shortcuts/common/key-code';
import { Shortcut } from '@/features/shortcuts/common/shortcut';
import { shortcutManager } from '@/features/shortcuts/directives/shortcut';
import _ from 'lodash';

export class ShortcutState {
    values: Shortcut[] = Array.from(DEFAULT_SHORTCUTS);
}
