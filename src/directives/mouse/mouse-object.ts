import { MouseAction } from './mouse-action';
import { MouseActionFunction } from './mouse-action-function';
import { MouseButton } from './mouse-button';
import { mouseObjectManager } from './mouse-object-manager';
import { MouseObjectSubscriber } from './mouse-object-subscriber';

/**
 * How many milliseconds before trigger a hold condition.
 */
export const HOLD_MIN = 250;

export class MouseObject {
    get subscriberCount() {
        return this.subscribers.length;
    }

    element: HTMLElement;
    mouseDown = false;
    holding = false;
    moved = false;

    private subscribers: MouseObjectSubscriber[];

    constructor(element: HTMLElement) {
        this.element = element;
        this.subscribers = [];

        (this.element as any).mouseObject = this;

        element.addEventListener('mousedown', onMouseDown);

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        console.log(window.onmousemove);
    }

    dispose() {
        this.element.removeEventListener('mousedown', onMouseDown);

        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
    }

    notify(action: MouseAction, button: MouseButton, event: MouseEvent) {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i].isMatch(action, button)) {
                this.subscribers[i].callback(this.element, event);
            }
        }
    }

    subscribe(action: MouseAction, callback: MouseActionFunction, button: MouseButton = 'either') {
        if (this.subscribers.some((s) => s.action === action && s.callback === callback && s.button === button)) {
            throw new Error('Duplicate subscriber');
        }

        this.subscribers.push(new MouseObjectSubscriber(action, callback, button));
    }

    desubscribe(action: MouseAction, callback: MouseActionFunction, button: MouseButton) {
        this.subscribers = this.subscribers.filter(
            (s) => s.action === action && s.callback === callback && s.button === button
        );
    }
}

/**
 * Mouse button was pressed event handler.
 * @param this HTMLElement event is on.
 * @param event MouseEvent details
 */
function onMouseDown(this: any, event: globalThis.MouseEvent) {
    event.stopImmediatePropagation();
    mouseObjectManager.active = this.mouseObject as MouseObject;
    mouseObjectManager.active.mouseDown = true;
    console.log('mouse down');
}

/**
 * Mouse is dragging an element.
 * @param this HTMLElement event is on.
 * @param event MouseEvent details
 */
function onMouseMove(this: any, event: globalThis.MouseEvent) {
    // event.stopImmediatePropagation();
    const mouseObject = mouseObjectManager.active as MouseObject;

    // If mouse is down, and moved assume drag
    if (mouseObject != null && mouseObject.mouseDown) {
        console.log('move start');
        const button = getButton(event.button);

        if (!mouseObject.holding) {
            mouseObject.holding = true;
            mouseObject.notify('hold', button, event);
        }

        mouseObject.notify('drag', button, event);
        console.log('drag');
    } else {
        console.log('no move');
    }
}

/**
 * Mouse button was released event handler.
 * @param this HTMLElement event occured on.
 * @param event MouseEvent details
 */
function onMouseUp(this: any, event: globalThis.MouseEvent) {
    event.stopImmediatePropagation();

    const button = getButton(event.button);
    const mouseObject = mouseObjectManager.active as MouseObject;

    if (!mouseObject.holding) {
        mouseObject.notify('click', button, event);
        console.log('click');
    } else {
        mouseObject.notify('release', button, event);
        console.log('release');
    }

    mouseObject.holding = false;
    mouseObject.mouseDown = false;
    mouseObjectManager.active = null;
    console.log('mouse down false');
}

function getButton(index: number): MouseButton {
    if (index === 0) {
        return 'left';
    } else if (index === 2) {
        return 'right';
    } else {
        return 'either';
    }
}
