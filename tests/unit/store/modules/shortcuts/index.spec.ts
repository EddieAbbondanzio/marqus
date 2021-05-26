import { KeyCode, Shortcut } from '@/directives/shortcut';
import { reviver, transformer } from '@/store/modules/shortcuts';
import { ShortcutState } from '@/store/modules/shortcuts/state';

describe('transformer()', () => {
    it('only returns shortcuts that are user defined.', () => {
        const state: ShortcutState = {
            values: [
                new Shortcut('foo', [KeyCode.Shift, KeyCode.ArrowLeft]),
                new Shortcut('bar', [KeyCode.Shift, KeyCode.ArrowLeft], true)
            ]
        };

        const { values } = transformer(state);

        expect(values).toHaveLength(1);
        expect(values[0]).toHaveProperty('name', 'bar');
    });

    it('serializes keys on shortcut into a string', () => {
        const state: ShortcutState = {
            values: [new Shortcut('bar', [KeyCode.Shift, KeyCode.ArrowLeft], true)]
        };

        const {
            values: [shortcut]
        } = transformer(state);

        expect(shortcut.keys).toBe('shift+left');
    });
});

describe('reviver()', () => {
    it('properly instantiates shortcuts and parses keys', () => {
        const raw = {
            values: [
                { name: 'foo', keys: 'control+shift+c' },
                { name: 'bar', keys: 'control+shift+v' }
            ]
        };

        const { values } = reviver(raw);
        expect(values).toHaveLength(2);
        expect(values[0]).toHaveProperty('keys', [KeyCode.Control, KeyCode.Shift, KeyCode.LetterC]);
        expect(values[1]).toHaveProperty('keys', [KeyCode.Control, KeyCode.Shift, KeyCode.LetterV]);
    });
});
