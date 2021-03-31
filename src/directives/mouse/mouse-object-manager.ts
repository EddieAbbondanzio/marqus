import { MouseObject } from './mouse-object';

class MouseObjectManager {
    objects: MouseObject[];
    active: MouseObject | null = null;
    timer: NodeJS.Timeout | null = null;

    constructor() {
        this.objects = [];
    }

    add(obj: MouseObject) {
        this.objects.push(obj);
    }

    get(el: HTMLElement) {
        return this.objects.find((o) => o.element == el);
    }

    remove(obj: MouseObject) {
        this.objects = this.objects.filter((o) => o != obj);
        obj.dispose();
    }
}

export const mouseObjectManager = new MouseObjectManager();
