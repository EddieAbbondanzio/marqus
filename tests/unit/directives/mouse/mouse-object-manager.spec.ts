import { MouseObject } from '@/directives/mouse/mouse-object';
import { MouseObjectManager } from '@/directives/mouse/mouse-object-manager';
import { store } from '@/store';

describe('MouseObjectManager', () => {
    const mockCommit = jest.fn();
    store.commit = mockCommit;

    beforeEach(() => {
        mockCommit.mockReset();
    });

    describe('ctor()', () => {
        it('adds event listener on mouse up', () => {
            const mockAddEventListener = jest.fn();
            window.addEventListener = mockAddEventListener;

            const m = new MouseObjectManager();

            expect(mockAddEventListener).toHaveBeenCalledTimes(3);
            expect(mockAddEventListener.mock.calls[0][0]).toBe('click');
            expect(mockAddEventListener.mock.calls[0][1]).toBe(m.onClickListener);
            expect(mockAddEventListener.mock.calls[1][0]).toBe('mousemove');
            expect(mockAddEventListener.mock.calls[1][1]).toBe(m.onMouseMoveListener);
            expect(mockAddEventListener.mock.calls[2][0]).toBe('keyup');
            expect(mockAddEventListener.mock.calls[2][1]).toBe(m.onKeyUpListener);
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

            expect(mockRemoveEventListener).toHaveBeenCalledTimes(3);
            expect(mockRemoveEventListener.mock.calls[0][0]).toBe('click');
            expect(mockRemoveEventListener.mock.calls[0][1]).toBe(m.onClickListener);
            expect(mockRemoveEventListener.mock.calls[1][0]).toBe('mousemove');
            expect(mockRemoveEventListener.mock.calls[1][1]).toBe(m.onMouseMoveListener);
            expect(mockRemoveEventListener.mock.calls[2][0]).toBe('keyup');
            expect(mockRemoveEventListener.mock.calls[2][1]).toBe(m.onKeyUpListener);
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
            const obj = new MouseObject(el, false, m);
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
            const obj = new MouseObject(el, false, m);
            m.add(obj);

            const obj2 = new MouseObject(document.createElement('a'), false, m);
            m.add(obj2);

            m.remove(obj);

            expect(m.objects).toHaveLength(1);
        });

        it('calls dispose of object to prevent memory leak', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');
            const obj = new MouseObject(el, false, m);
            obj.dispose = jest.fn();

            m.add(obj);
            m.remove(obj);

            expect(obj.dispose).toHaveBeenCalled();
        });
    });

    describe('onKeyUp()', () => {
        it('does nothing if active is null', () => {
            const m = new MouseObjectManager();

            m.onKeyUp({ key: 'Escape' } as any);
            expect(m.cancelled).toBeFalsy();
        });

        it('does nothing if not holding', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');

            const obj = new MouseObject(el, false, m);

            m.active = obj;

            m.onKeyUp({ key: 'Escape' } as any);
            expect(m.cancelled).toBeFalsy();
        });

        it('sets cancelled as true when escape is pressed', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');

            const obj = new MouseObject(el, false, m);
            obj.holding = true;

            m.active = obj;

            m.onKeyUp({ key: 'Escape' } as any);
            expect(m.cancelled).toBeTruthy();
        });

        it('notifies active of dragcancel event', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');

            const obj = new MouseObject(el, false, m);
            obj.holding = true;

            const mockNotify = jest.fn();

            obj.notify = mockNotify;

            m.active = obj;

            m.onKeyUp({ key: 'Escape' } as any);
            expect(mockNotify).toHaveBeenCalled();
            expect(mockNotify.mock.calls[0][0]).toBe('dragcancel');
        });

        it('resets cursor icon', () => {
            const m = new MouseObjectManager();
            const el = document.createElement('div');

            const obj = new MouseObject(el, false, m);
            obj.holding = true;

            const mockNotify = jest.fn();

            obj.notify = mockNotify;

            m.active = obj;

            m.onKeyUp({ key: 'Escape' } as any);

            expect(mockCommit).toHaveBeenCalled();
            expect(mockCommit.mock.calls[0][0]).toBe('app/RESET_CURSOR_ICON');
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
            const obj = new MouseObject(document.createElement('a'), false, manager);
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

            const obj = new MouseObject(document.createElement('a'), false, manager);
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

            const obj = new MouseObject(document.createElement('a'), false, manager);
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

            const obj = new MouseObject(document.createElement('a'), false, manager);
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
            const obj = new MouseObject(document.createElement('a'), false, m);
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
            const obj = new MouseObject(document.createElement('a'), false, m);
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
            const obj = new MouseObject(document.createElement('a'), false, m);
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
            const obj = new MouseObject(document.createElement('a'), false, m);
            obj.holding = true;

            m.active = obj;

            m.onMouseUp(mockEvent);

            expect(obj.holding).toBeFalsy();
            expect(obj.mouseDown).toBeFalsy();
            expect(obj.activeButton).toBeUndefined();
            expect(m.active).toBeFalsy();
            expect(m.cancelled).toBeFalsy();
        });

        it('does not notify release event subscribers if cancelled', () => {
            const m = new MouseObjectManager();
            const mockEvent = {
                stopImmediatePropagation: jest.fn()
            } as any;

            // Set active as a quick hack
            const obj = new MouseObject(document.createElement('a'), false, m);
            const mockNotify = jest.fn();
            obj.notify = mockNotify;
            obj.holding = true;

            m.active = obj;

            m.cancelled = true;

            m.onMouseUp(mockEvent);

            expect(mockNotify).not.toHaveBeenCalledTimes(1);
        });
    });
});
