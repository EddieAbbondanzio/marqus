import { KeyCode } from '@/features/shortcuts/shared/key-code';
import { Shortcut } from '@/features/shortcuts/shared/shortcut';
import { shortcuts } from '@/features/shortcuts/shared/shortcuts';
import { ShortcutMutations } from '@/features/shortcuts/store/mutations';
import { ShortcutState } from '@/features/shortcuts/store/state';
import { inject } from 'vuex-smart-module';

describe('shortcut mutations', () => {
    describe('SET_STATE', () => {
        it('registers shortcuts', () => {
            let state: ShortcutState;
            let mutations: ShortcutMutations;

            state = new ShortcutState();
            mutations = inject(ShortcutMutations, {
                state
            });

            const spy = jest.spyOn(shortcuts, 'register');

            const values = [
                new Shortcut('test', [KeyCode.Space]),
                new Shortcut('test2', [KeyCode.Control, KeyCode.Space])
            ];

            mutations.SET_STATE({
                values
            });

            expect(spy).toHaveBeenCalledWith(values);
        });
    });
});
