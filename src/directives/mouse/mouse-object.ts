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
    }

    dispose() {
        this.element.removeEventListener('mousedown', onMouseDown);
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
}
