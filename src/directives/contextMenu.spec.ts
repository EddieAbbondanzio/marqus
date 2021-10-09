import { contextMenu, CONTEXT_MENU_ATTRIBUTE } from '@/directives/context-menu';

describe('contextMenu directive', () => {
    describe('mounted()', () => {
        it('throws if name is null', () => {
            expect(() => {
                (contextMenu as any).mounted(null, { arg: null });
            }).toThrow();
        });

        it('sets an attribute on the element.', () => {
            const el = {
                setAttribute: jest.fn()
            };

            (contextMenu as any).mounted(el, { arg: 'testName' });
            expect(el.setAttribute).toHaveBeenCalled();
            expect(el.setAttribute.mock.calls[0][0]).toBe(CONTEXT_MENU_ATTRIBUTE);
            expect(el.setAttribute.mock.calls[0][1]).toBe('testName');
        });
    });
});
