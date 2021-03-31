import { MouseAction } from './mouse-action';
import { MouseActionFunction } from './mouse-action-function';
import { MouseButton } from './mouse-button';

export class MouseObjectSubscriber {
    constructor(public action: MouseAction, public callback: MouseActionFunction, public button: MouseButton) {}

    isMatch(action: MouseAction, button: MouseButton) {
        return this.action == action && (this.button == button || this.button == 'either');
    }
}
