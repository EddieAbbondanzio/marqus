import { MouseObject } from './mouse-object';
import { getButton } from './mouse-button';

class MouseObjectManager {
    objects: MouseObject[];
    active: MouseObject | null = null;

    constructor() {
        this.objects = [];

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
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
}

export const mouseObjectManager = new MouseObjectManager();

/**
 * Mouse is dragging an element.
 * @param this HTMLElement event is on.
 * @param event MouseEvent details
 */
function onMouseMove(this: any, event: globalThis.MouseEvent) {
    event.stopImmediatePropagation();
    const mouseObject = mouseObjectManager.active as MouseObject;

    // If mouse is down, and moved assume drag
    if (mouseObject != null && mouseObject.mouseDown) {
        document.body.setAttribute('data-dragging', 'true');

        const button = getButton(event.button);

        if (!mouseObject.holding) {
            mouseObject.holding = true;
            mouseObject.notify('hold', button, event);
        }

        mouseObject.notify('drag', button, event);
    }

    console.log(document.body.style.cursor);
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
    } else {
        mouseObject.notify('release', button, event);
        document.body.removeAttribute('data-dragging');
    }

    mouseObject.holding = false;
    mouseObject.mouseDown = false;
    mouseObjectManager.active = null;
}
