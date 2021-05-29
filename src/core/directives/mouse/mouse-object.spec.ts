import { MouseObject } from '@/core/directives/mouse/mouse-object';
import { MouseObjectManager } from '@/core/directives/mouse/mouse-object-manager';
import { MouseObjectSubscriber } from '@/core/directives/mouse/mouse-object-subscriber';

describe('MouseObject', () => {
    const mouseObjectManager = new MouseObjectManager();

    describe('subscriberCount', () => {
        it('returns length of subscribers', () => {
            const el = document.createElement('div');

            const obj = new MouseObject(el, false, mouseObjectManager);
            obj.subscribers.push(null!);
            obj.subscribers.push(null!);

            expect(obj.subscriberCount).toBe(2);
        });
    });

    describe('dispose()', () => {
        it('removes event listener', () => {
            const el = ({
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            } as any) as HTMLElement;

            const obj = new MouseObject(el, false, mouseObjectManager);
            obj.dispose();

            expect(el.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('notify()', () => {
        it('triggers callbatch of matches', () => {
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, mouseObjectManager);
            const sub = new MouseObjectSubscriber('click', 'left', jest.fn());

            obj.subscribers.push(sub);
            obj.notify('click', 'left', null!);

            expect(sub.callback).toHaveBeenCalled();
        });

        it("skips subscribers that don' match", () => {
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, mouseObjectManager);
            const sub = new MouseObjectSubscriber('click', 'right', jest.fn());

            obj.subscribers.push(sub);
            obj.notify('click', 'left', null!);

            expect(sub.callback).not.toHaveBeenCalled();
        });
    });

    describe('subscribe()', () => {
        it('adds subscriber', () => {
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, mouseObjectManager);

            const cb = jest.fn();

            obj.subscribe('click', 'left', cb);

            expect(obj.subscriberCount).toBe(1);
        });

        it('throws if duplicate found', () => {
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, mouseObjectManager);

            const cb = jest.fn();

            obj.subscribe('click', 'left', cb);

            expect(() => {
                obj.subscribe('click', 'left', cb);
            }).toThrow();
        });
    });

    describe('unsubscribe()', () => {
        it('removes subscriber that matches', () => {
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, mouseObjectManager);

            const cb = jest.fn();
            const cb2 = jest.fn();

            obj.subscribe('click', 'left', cb);
            obj.subscribe('click', 'right', cb2);

            obj.unsubscribe('click', 'left', cb);

            expect(obj.subscriberCount).toBe(1);
        });
    });

    describe('onMouseDown()', () => {
        it("doesn't set active if no subscribers have button pressed", () => {
            const el = document.createElement('a');
            const manager = {} as any;
            const obj = new MouseObject(el, false, manager);

            obj.onMouseDown({ button: 0 } as MouseEvent);
            expect(manager.active).toBeFalsy();
        });

        it('sets active if any subscribers have the button that was pressed', () => {
            const el = document.createElement('a');
            const manager = {} as any;
            const obj = new MouseObject(el, false, manager);
            obj.subscribe('click', 'left', () => {});

            obj.onMouseDown(({ button: 0, stopImmediatePropagation: jest.fn() } as any) as MouseEvent);
            expect(manager.active).toBe(obj);
        });
    });
});
