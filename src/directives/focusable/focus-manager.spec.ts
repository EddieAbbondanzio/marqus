import { FocusManager } from '@/directives/focusable/focus-manager';

describe('FocusManager {}', () => {
    describe('ctor()', () => {
        it('subscribes to focusin', () => {
            window.addEventListener = jest.fn();

            const m = new FocusManager();

            expect(window.addEventListener).toHaveBeenCalled();
        });
    });

    describe('register()', () => {
        it('adds new focusable to array', () => {
            const m = new FocusManager();

            m.register('foo', document.createElement('div'));

            expect(m.focusables).toHaveLength(1);
            expect(m.focusables[0]).toHaveProperty('name', 'foo');
        });
    });

    describe('remove()', () => {
        it('removes focusable from array', () => {
            const m = new FocusManager();

            m.register('foo', document.createElement('div'));
            m.register('bar', document.createElement('div'));

            m.remove('foo');

            expect(m.focusables).toHaveLength(1);
            expect(m.focusables[0]).toHaveProperty('name', 'bar');
        });
    });

    describe('focus()', () => {
        it('throws if not found', () => {
            expect(() => new FocusManager().focus('foo')).toThrow();
        });

        // it('calls focus() on element', () => {
        //     const m = new FocusManager();
        //     const el = document.createElement('div');
        //     el.focus = jest.fn();

        //     m.register('foo', el);

        //     m.focus('foo');
        //     expect(el.focus).toHaveBeenCalled();
        // });
    });

    describe('isFocused()', () => {
        it('returns false if nothing is focused', () => {
            const m = new FocusManager();
            expect(m.isFocused('cat')).toBeFalsy();
        });

        it('returns false if name does not match', () => {
            const m = new FocusManager();
            m.active = { value: { name: 'foo', el: null! } } as any;

            expect(m.isFocused('bar')).toBeFalsy();
        });

        it('returns true if name matches', () => {
            const m = new FocusManager();
            m.active = { value: { name: 'foo', el: null! } } as any;

            expect(m.isFocused('foo')).toBeTruthy();
        });
    });

    describe('dispose()', () => {
        it('removes event listener', () => {
            const m = new FocusManager();
            window.removeEventListener = jest.fn();

            m.dispose();
            expect(window.removeEventListener).toHaveBeenCalled();
        });
    });
});
