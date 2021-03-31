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

    private subscribers: MouseObjectSubscriber[];

    constructor(element: HTMLElement) {
        this.element = element;
        this.subscribers = [];

        (this.element as any).mouseObject = this;

        element.addEventListener('mousedown', onMouseDown);

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
    }

    dispose() {
        this.element.removeEventListener('mousedown', onMouseDown);

        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('mousemove', onMouseMove);
    }

    notify(action: MouseAction, button: MouseButton, event: MouseEvent) {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (
                action === this.subscribers[i].action &&
                (button === this.subscribers[i].button || this.subscribers[i].button === 'either')
            ) {
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

    mouseObjectManager.timer = setTimeout(() => {
        mouseObjectManager.active!.holding = true;

        const button = getButton(event.button);
        mouseObjectManager.active!.notify('hold', button, event);
    }, HOLD_MIN);
}

/**
 * Mouse is dragging an element.
 * @param this HTMLElement event is on.
 * @param event MouseEvent details
 */
function onMouseMove(this: any, event: globalThis.MouseEvent) {
    event.stopImmediatePropagation();
    const mouseObject = mouseObjectManager.active as MouseObject;

    if (mouseObject == null || !mouseObject.mouseDown) {
        return;
    }

    const button = getButton(event.button);

    // Trigger the hold event, as soon as a drag starts
    if (!mouseObject.holding) {
        mouseObject.holding = true;
        mouseObject.notify('hold', button, event);
    }

    mouseObject.notify('drag', button, event);
}

/**
 * Mouse button was released event handler.
 * @param this HTMLElement event occured on.
 * @param event MouseEvent details
 */
function onMouseUp(this: any, event: globalThis.MouseEvent) {
    event.stopImmediatePropagation();
    if (mouseObjectManager.timer != null) {
        const button = getButton(event.button);
        const mouseObject = mouseObjectManager.active as MouseObject;

        if (!mouseObject.holding) {
            mouseObject.notify('click', button, event);
        } else {
            mouseObject.notify('release', button, event);
        }

        clearTimeout(mouseObjectManager.timer);
        mouseObjectManager.timer = null;
        mouseObject.holding = false;
        mouseObject.mouseDown = false;
    }
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
