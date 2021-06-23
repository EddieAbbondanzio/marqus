import { KeyCode } from '@/features/shortcuts/common/key-code';
import { Shortcut } from '@/features/shortcuts/common/shortcut';
import { ShortcutManager } from '@/features/shortcuts/common/shortcut-manager';

describe('ShortcutManager', () => {
    describe('ctor', () => {
        it('subscribes to keydown, and keyup', () => {
            const mock = jest.fn();
            window.addEventListener = mock;

            const m = new ShortcutManager();
            expect(mock).toHaveBeenCalledTimes(2);

            expect(mock.mock.calls[0][0]).toBe('keydown');
            expect(mock.mock.calls[0][1]).toBe(m._onKeyDown);

            expect(mock.mock.calls[1][0]).toBe('keyup');
            expect(mock.mock.calls[1][1]).toBe(m._onKeyUp);
            m.dispose();
        });
    });

    describe('_onKeyDown()', () => {
        it('only notifies subs once', () => {
            const m = new ShortcutManager();
            const shortcut = new Shortcut('test', [KeyCode.Space, KeyCode.LetterA]);
            m.shortcuts.push(shortcut);

            const callback = jest.fn();
            m.subscribe('test', callback);

            const e1 = new KeyboardEvent('keydown', { code: 'Space' });
            m._onKeyDown(e1);

            const e2 = new KeyboardEvent('keydown', { code: 'KeyA' });
            m._onKeyDown(e2);

            const e3 = new KeyboardEvent('keydown', { code: 'KeyQ' });
            m._onKeyDown(e3);

            expect(callback).toHaveBeenCalledTimes(1);
            m.dispose();
        });

        it('notifies all subscribers that match', () => {
            const m = new ShortcutManager();
            const shortcut = new Shortcut('test', [KeyCode.Space, KeyCode.LetterA]);
            m.shortcuts.push(shortcut);

            const callback1 = jest.fn();
            const callback2 = jest.fn();
            m.subscribe('test', callback1);
            m.subscribe('test', callback2);

            const e1 = new KeyboardEvent('keydown', { code: 'Space' });
            m._onKeyDown(e1);

            const e2 = new KeyboardEvent('keydown', { code: 'KeyA' });
            m._onKeyDown(e2);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
            m.dispose();
        });

        it('wont notify subscriber unless when is true', () => {
            const m = new ShortcutManager();
            const shortcut = new Shortcut('test', [KeyCode.Space, KeyCode.LetterA]);
            m.shortcuts.push(shortcut);

            const callback1 = jest.fn();
            const callback2 = jest.fn();
            m.subscribe('test', callback1, { when: () => false });
            m.subscribe('test', callback2);

            const e1 = new KeyboardEvent('keydown', { code: 'Space' });
            m._onKeyDown(e1);

            const e2 = new KeyboardEvent('keydown', { code: 'KeyA' });
            m._onKeyDown(e2);

            expect(callback1).toHaveBeenCalledTimes(0);
            expect(callback2).toHaveBeenCalledTimes(1);
            m.dispose();
        });

        it('notifies all subscribers that match and when is true', () => {
            const m = new ShortcutManager();
            const shortcut = new Shortcut('test', [KeyCode.Space, KeyCode.LetterA]);
            m.shortcuts.push(shortcut);

            const callback1 = jest.fn();
            const callback2 = jest.fn();
            m.subscribe('test', callback1, { when: () => true });
            m.subscribe('test', callback2);

            const e1 = new KeyboardEvent('keydown', { code: 'Space' });
            m._onKeyDown(e1);

            const e2 = new KeyboardEvent('keydown', { code: 'KeyA' });
            m._onKeyDown(e2);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
            m.dispose();
        });
    });

    describe('_onKeyUp()', () => {
        it('deletes key from keyboard state', () => {
            const m = new ShortcutManager();
            m.activeKeys[KeyCode.Space] = true;

            m._onKeyUp({ code: 'Space' } as any);
            expect(m.activeKeys[KeyCode.Space]).toBeUndefined();
            m.dispose();
        });
    });

    describe('define()', () => {
        it('adds new shortcut to list', () => {
            const m = new ShortcutManager();

            expect(m.shortcuts).toHaveLength(0);
            m.register(new Shortcut('test', [KeyCode.Space, KeyCode.LetterA]));
            expect(m.shortcuts).toHaveLength(1);

            m.dispose();
        });
    });

    describe('getSubscribersByElement', () => {
        it('returns proper subs', () => {
            const m = new ShortcutManager();
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');

            m.subscribe('test', () => {}, { el: el1 });
            m.subscribe('test', () => {}, { el: el2 });

            const subs = m.getSubscribersByElement(el1);
            console.log(subs);
            expect(subs).toHaveLength(1);
        });
    });

    describe('subscribe()', () => {
        it('creates new subscriber array for empty shortcut', () => {
            const m = new ShortcutManager();

            expect(m.subscribers['test']).toBeUndefined();
            const s = m.subscribe('test', () => {});
            expect(m.subscribers['test']).toBeInstanceOf(Array);
        });

        it('adds to existing subscriber array on shortcut with other listeners', () => {
            const m = new ShortcutManager();
            const s1 = m.subscribe('test', () => {});
            const s2 = m.subscribe('test', () => {});

            expect(m.subscribers['test']).toHaveLength(2);
        });
    });

    describe('unsubscribe()', () => {
        it('removes subscriber', () => {
            const m = new ShortcutManager();
            const s = m.subscribe('test', () => {});

            expect(m.subscribers['test']).toHaveLength(1);
            m.unsubscribe(s);
            expect(m.subscribers['test']).toHaveLength(0);
        });
    });

    describe('dispose()', () => {
        it('removes event listeners.', () => {
            const mock = jest.fn();
            window.removeEventListener = mock;

            const m = new ShortcutManager();
            m.dispose();

            expect(mock.mock.calls[0][0]).toBe('keydown');
            expect(mock.mock.calls[0][1]).toBe(m._onKeyDown);

            expect(mock.mock.calls[1][0]).toBe('keyup');
            expect(mock.mock.calls[1][1]).toBe(m._onKeyUp);
        });
    });
});
