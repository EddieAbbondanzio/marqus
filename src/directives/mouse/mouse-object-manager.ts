import { MouseObject } from './mouse-object';
import { getButton } from './mouse-button';
import { store } from '@/store';

export class MouseObjectManager {
    objects: MouseObject[];
    active: MouseObject | null = null;

    onMouseMoveListener: (e: MouseEvent) => any;
    onMouseUpListener: (e: MouseEvent) => any;

    constructor() {
        this.objects = [];

        this.onMouseMoveListener = this.onMouseMove.bind(this);
        this.onMouseUpListener = this.onMouseUp.bind(this);

        window.addEventListener('mouseup', this.onMouseUpListener);
        window.addEventListener('mousemove', this.onMouseMoveListener);
    }

    dispose() {
        window.removeEventListener('mouseup', this.onMouseUpListener);
        window.removeEventListener('mousemove', this.onMouseMoveListener);
    }

    add(obj: MouseObject) {
        this.objects.push(obj);
    }

    get(el: HTMLElement) {
        return this.objects.find((o) => o.element === el);
    }

    remove(obj: MouseObject) {
        this.objects = this.objects.filter((o) => o !== obj);
        obj.dispose();
    }

    /**
     * Mouse is dragging an element.
     * @param event MouseEvent details
     */
    onMouseMove(event: MouseEvent) {
        if (this.active == null) {
            return;
        }

        event.stopImmediatePropagation();

        // If mouse is down, and moved assume drag
        if (this.active.mouseDown) {
            const button = getButton(event.button);

            if (!this.active.holding) {
                this.active.holding = true;
                this.active.notify('hold', button, event);

                store.commit('app/SET_CURSOR_ICON', 'grabbing');
            }

            this.active.notify('drag', button, event);
        }
    }

    /**
     * Mouse button was released event handler.
     * @param event MouseEvent details
     */
    onMouseUp(event: MouseEvent) {
        if (this.active == null) {
            return;
        }

        event.stopImmediatePropagation();
        const button = getButton(event.button);

        if (!this.active.holding) {
            this.active.notify('click', button, event);
        } else {
            this.active.notify('release', button, event);
            store.commit('app/RESET_CURSOR_ICON');
        }

        this.active.holding = false;
        this.active.mouseDown = false;
        this.active = null;
    }
}
