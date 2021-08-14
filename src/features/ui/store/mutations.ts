import { MutationTree } from 'vuex';
import { Mutations } from 'vuex-smart-module';
import { UserInterfaceState } from './state';

export class UserInterfaceMutations extends Mutations<UserInterfaceState> {
    SET_STATE(s: UserInterfaceState) {
        Object.assign(this.state, s);
        console.log('ui state was set', this.state);
    }

    SET_CURSOR_ICON(icon: string) {
        this.state.cursor.icon = icon;
    }

    RESET_CURSOR_ICON() {
        this.state.cursor.icon = 'pointer';
    }

    CURSOR_DRAGGING(dragging?: boolean) {
        this.state.cursor.dragging = dragging;
    }
}
