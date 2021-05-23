import { isModifier, isValidKeyCode, KeyCode, parseKey } from '@/directives/shortcut/key-code';
import _ from 'lodash';

export const SHORTCUT_STRING_DELIMITER = '+';

export class Shortcut {
    public readonly keys: ReadonlyArray<KeyCode>;

    constructor(keys: KeyCode[]) {
        if (new Set(keys).size != keys.length) {
            throw Error('Duplicate keys detected in shortcut');
        }

        const shortcutKeys: KeyCode[] = [];

        const [modifiers, normalKeys] = _.partition(keys, isModifier);
        const modifierFlags = modifiers.reduce(
            (accumulator: any, modifier) => ({ ...accumulator, [modifier]: true }),
            {}
        );

        /*
         * Modifiers should always be first, and in a specific order.
         */

        if (modifierFlags.ctrl) {
            shortcutKeys.push(KeyCode.Control);
        }

        if (modifierFlags.shift) {
            shortcutKeys.push(KeyCode.Shift);
        }

        if (modifierFlags.alt) {
            shortcutKeys.push(KeyCode.Alt);
        }

        // Add the rest of the keys. These can be in any order.
        shortcutKeys.push(...normalKeys);

        this.keys = shortcutKeys;
    }

    isMatch(activeKeys: KeyCode[]) {
        // Check for the same amount of keys first
        if (activeKeys.length !== this.keys.length) {
            return false;
        }

        // XOR will return elements in one, but not the other. So if we have none returned we have a match!
        return _.xor(this.keys, activeKeys).length === 0;
    }

    toString() {
        return this.keys.join(SHORTCUT_STRING_DELIMITER);
    }

    /*
     * STOP! Don't write any methods that will manipulate the object itself because this class
     * is used within Vuex, and will throw errors.
     */
}

/**
 * Parse a shortcut string literal into it's original form. Throws if invalid.
 * @param shortcutString The shortcut string to parse.
 * @returns The extracted shortcut.
 */
export function shortcutFromString(shortcutString: string): Shortcut {
    // Split up the keys, and remove any duplicates.
    const rawKeys = _.uniq(shortcutString.split(SHORTCUT_STRING_DELIMITER));
    const keys: KeyCode[] = [];

    for (const key of rawKeys) {
        if (!isValidKeyCode(key)) {
            throw Error(`Invalid key code: ${key}`);
        }

        keys.push(parseKey(key));
    }

    return new Shortcut(keys);
}

/**
 *
 * @param keys Keys to build the shortcut from.
 * @returns
 */
export function shortcutFromKeys(...keys: KeyCode[]): Shortcut {
    return new Shortcut(keys);
}
