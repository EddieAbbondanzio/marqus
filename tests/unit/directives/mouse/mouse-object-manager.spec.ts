import { MouseObject } from '@/directives/mouse/mouse-object';
import { MouseObjectManager } from '@/directives/mouse/mouse-object-manager';

describe('MouseObjectManager', () => {
    describe('ctor()', () => {
        it('adds event listener on mouse up', () => {
            const mockAddEventListener = jest.fn();
            window.addEventListener = mockAddEventListener;

            const m = new MouseObjectManager();

            expect(mockAddEventListener).toHaveBeenCalledTimes(2);
            expect(mockAddEventListener.mock.calls[0][0]).toBe('mouseup');
            expect(mockAddEventListener.mock.calls[0][1]).toBe(m.onMouseUpListener);
            expect(mockAddEventListener.mock.calls[1][0]).toBe('mousemove');
            expect(mockAddEventListener.mock.calls[1][1]).toBe(m.onMouseMoveListener);
        });
    });

    describe('dispose()', () => {
        it('releases event listeners', () => {
            const mockAddEventListener = jest.fn();
            const mockRemoveEventListener = jest.fn();
            window.addEventListener = mockAddEventListener;
            window.removeEventListener = mockRemoveEventListener;

            const m = new MouseObjectManager();
            m.dispose();

            expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
            expect(mockRemoveEventListener.mock.calls[0][0]).toBe('mouseup');
            expect(mockRemoveEventListener.mock.calls[0][1]).toBe(m.onMouseUpListener);
            expect(mockRemoveEventListener.mock.calls[1][0]).toBe('mousemove');
            expect(mockRemoveEventListener.mock.calls[1][1]).toBe(m.onMouseMoveListener);
        });
    });

    describe('add()', () => {
        it('adds object to array', () => {
            const m = new MouseObjectManager();
            m.add(null!);

            expect(m.objects).toHaveLength(1);
        });
    });

    describe('get()', () => {
        it('returns mouse object by matching html element', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');
            const obj = new MouseObject(el, m);
            m.add(obj);

            const found = m.get(el);
            expect(found).toBe(obj);
        });

        it('returns null if no match', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');

            const found = m.get(el);
            expect(found).toBeFalsy();
        });
    });

    describe('remove()', () => {
        it('removes object from array', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');
            const obj = new MouseObject(el, m);
            m.add(obj);

            const obj2 = new MouseObject(document.createElement('a'), m);
            m.add(obj2);

            m.remove(obj);

            expect(m.objects).toHaveLength(1);
        });

        it('calls dispose of object to prevent memory leak', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');
            const obj = new MouseObject(el, m);
            obj.dispose = jest.fn();

            m.add(obj);
            m.remove(obj);

            expect(obj.dispose).toHaveBeenCalled();
        });
    });

    describe('onMouseMove()', () => {
        it('checks to see if active object exists first', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            m.onMouseMove(mockEvent);

            // We use this as a way to see if we made it passed the null check.
            expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
        });

        it('stops propagation', () => {
            const manager = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), manager);
            manager.active = obj;

            manager.onMouseMove(mockEvent);

            // We use this as a way to see if we made it passed the null check.
            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
        });

        it('stops if mouseDown is false', () => {
            const manager = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            const obj = new MouseObject(document.createElement('a'), manager);
            obj.notify = jest.fn();

            manager.active = obj;

            manager.onMouseMove(mockEvent);

            expect(obj.notify).not.toHaveBeenCalled();
        });

        it('sets holding to true if not already, and notifies hold + drag', () => {
            const manager = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            const obj = new MouseObject(document.createElement('a'), manager);
            const mockNotify = jest.fn();
            obj.notify = mockNotify;
            obj.mouseDown = true;

            manager.active = obj;

            manager.onMouseMove(mockEvent);

            expect(obj.holding).toBeTruthy();
            expect(mockNotify).toHaveBeenCalledTimes(2);
            expect(mockNotify.mock.calls[0][0]).toBe('hold');
            expect(mockNotify.mock.calls[1][0]).toBe('drag');
        });

        it('notifies drag subscribers, but not hold if already holding', () => {
            const manager = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            const obj = new MouseObject(document.createElement('a'), manager);
            const mockNotify = jest.fn();
            obj.notify = mockNotify;
            obj.mouseDown = true;
            obj.holding = true;

            manager.active = obj;

            manager.onMouseMove(mockEvent);

            expect(obj.holding).toBeTruthy();
            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify.mock.calls[0][0]).toBe('drag');
        });
    });

    describe('onMouseUp()', () => {
        it('checks to see if active object exists first', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            m.onMouseUp(mockEvent);

            // We use this as a way to see if we made it passed the null check.
            expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
        });

        it('stops propagation', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), m);
            m.active = obj;

            m.onMouseUp(mockEvent);

            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
        });

        it('notifies click subscribers if not holding', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), m);
            const mockNotify = jest.fn();
            obj.notify = mockNotify;

            m.active = obj;

            m.onMouseUp(mockEvent);

            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify.mock.calls[0][0]).toBe('click');
        });

        it('notifies release subscribers if holding', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), m);
            const mockNotify = jest.fn();
            obj.notify = mockNotify;
            obj.holding = true;

            m.active = obj;

            m.onMouseUp(mockEvent);

            expect(mockNotify).toHaveBeenCalledTimes(1);
            expect(mockNotify.mock.calls[0][0]).toBe('release');
        });

        it('resets holding, mouseDown, and active', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), m);
            obj.holding = true;

            m.active = obj;

            m.onMouseUp(mockEvent);

            expect(obj.holding).toBeFalsy();
            expect(obj.mouseDown).toBeFalsy();
            expect(m.active).toBeFalsy();
        });
    });
});
