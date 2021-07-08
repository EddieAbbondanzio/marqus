import { UserInterfaceGetters } from '@/features/ui/store/getters';
import { UserInterfaceMutations } from '@/features/ui/store/mutations';
import { State } from '@/store/state';
import { ActionTree } from 'vuex';
import { Actions } from 'vuex-smart-module';
import { UserInterfaceState, state } from './state';

export class UserInterfaceActions extends Actions<
    UserInterfaceState,
    UserInterfaceGetters,
    UserInterfaceMutations,
    UserInterfaceActions
> {
    cursorDraggingStart() {
        this.commit('SET_CURSOR_ICON', 'grabbing');
        this.commit('CURSOR_DRAGGING', true);
    }

    cursorDraggingStop() {
        this.commit('RESET_CURSOR_ICON');
        this.commit('CURSOR_DRAGGING', false);
    }
}
