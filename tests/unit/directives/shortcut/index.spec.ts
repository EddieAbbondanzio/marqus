import { shortcut, shortcutManager } from '@/directives/shortcut';
import { KeyCode } from '@/directives/shortcut/key-code';

describe('v-shortcut', () => {
    beforeEach(() => {
        shortcutManager.reset();
    });

    describe('beforeMount()', () => {
        it('throws if no shortcut name', () => {
            expect(() => {
                const el = document.createElement('div');

                shortcut.beforeMount(el, {
                    arg: null!,
                    value: () => {}
                } as any);
            }).toThrow();
        });

        it('throws if no callback', () => {
            expect(() => {
                const el = document.createElement('div');

                shortcut.beforeMount(el, {
                    arg: 'cat',
                    value: null!
                } as any);
            }).toThrow();
        });

        it('subscribes and caches subscriber under .subscriber', () => {
            const el = document.createElement('div');

            shortcut.beforeMount(el, {
                arg: 'name',
                value: () => {}
            } as any);

            expect(shortcutManager.subscribers['name']).toHaveLength(1);
            expect((el as any).subscriber).toBeTruthy();
        });
    });

    describe('unmounted()', () => {
        it('throws if no subscriber on element', () => {
            expect(() => {
                shortcut.unmounted(document.createElement('div'), {} as any);
            }).toThrow();
        });

        it('calls unsubscribe on subscriber', () => {
            const el = document.createElement('div');

            shortcut.beforeMount(el, {
                arg: 'name',
                value: () => {}
            } as any);

            expect(shortcutManager.subscribers['name']).toHaveLength(1);

            shortcut.unmounted(el, {} as any);

            expect(shortcutManager.subscribers['name']).toHaveLength(0);
            expect((el as any).subscriber).toBeUndefined();
        });
    });

    describe('reset()', () => {
        it('resets subscribers, activeKeys, and shortcuts', () => {
            shortcutManager.shortcuts = [{} as any];
            shortcutManager.subscribers['test'] = [];
            shortcutManager.activeKeys = { [KeyCode.Space]: true };

            shortcutManager.reset();
            expect(shortcutManager.shortcuts).toHaveLength(0);
            expect(shortcutManager.activeKeys).toEqual({});
            expect(shortcutManager.subscribers).toEqual({});
        });
    });
});
