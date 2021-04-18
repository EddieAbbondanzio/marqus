import { MouseAction } from './mouse-action';
import { MouseActionFunction } from './mouse-action-function';
import { getButton, MouseButton } from './mouse-button';
import { MouseObjectManager } from './mouse-object-manager';
import { MouseObjectSubscriber } from './mouse-object-subscriber';

export class MouseObject {
    get subscriberCount() {
        return this.subscribers.length;
    }

    element: HTMLElement;
    manager: MouseObjectManager;
    mouseDown = false;
    holding = false;
    moved = false;

    subscribers: MouseObjectSubscriber[];

    constructor(element: HTMLElement, manager: MouseObjectManager) {
        this.element = element;
        this.subscribers = [];

        (this.element as any).mouseObject = this;
        this.manager = manager;

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

    subscribe(action: MouseAction, button: MouseButton, callback: MouseActionFunction) {
        if (this.subscribers.some((s) => s.action === action && s.callback === callback && s.button === button)) {
            throw new Error('Duplicate subscriber');
        }

        this.subscribers.push(new MouseObjectSubscriber(action, button, callback));
    }

    unsubscribe(action: MouseAction, button: MouseButton, callback: MouseActionFunction) {
        const keep = [];

        for (let i = 0; i < this.subscribers.length; i++) {
            const sub = this.subscribers[i];

            if (sub.isMatch(action, button) && sub.callback === callback) {
                continue;
            } else {
                keep.push(sub);
            }
        }

        this.subscribers = keep;
    }

    /**
     * Mouse button was pressed event handler.
     * @param this HTMLElement event is on.
     * @param event MouseEvent details
     */
    onMouseDown(event: globalThis.MouseEvent) {
        // Check to see if we should care about it
        const button = getButton(event.button);

        if (this.subscribers.some((s) => s.button === button)) {
            event.stopImmediatePropagation();

            this.mouseDown = true;
            this.manager.active = this;
        }
    }
}
