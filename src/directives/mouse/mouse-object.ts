import { MouseAction } from './mouse-action';
import { MouseActionFunction } from './mouse-action-function';
import { getButton, MouseButton } from './mouse-button';
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

    subscribers: MouseObjectSubscriber[];

    constructor(element: HTMLElement) {
        this.element = element;
        this.subscribers = [];

        (this.element as any).mouseObject = this;

        element.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    dispose() {
        this.element.removeEventListener('mousedown', this.onMouseDown);
    }

    notify(action: MouseAction, button: MouseButton, event: MouseEvent) {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (this.subscribers[i].isMatch(action, button)) {
                this.subscribers[i].callback(event);
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

    /**
     * Mouse button was pressed event handler.
     * @param this HTMLElement event is on.
     * @param event MouseEvent details
     */
    onMouseDown(event: globalThis.MouseEvent) {
        // Check to see if we should care about it
        const button = getButton(event.button);
        console.log(this);

        if (this.subscribers.some((s) => s.button === button)) {
            event.stopImmediatePropagation();
            mouseObjectManager.active = this;
            mouseObjectManager.active.mouseDown = true;
        }
    }
}
