import { GlobalNavigationStore } from '@/features/ui/store/modules/global-navigation/global-navigation-store';
import type { UserInterface } from '@/features/ui/store/state';
import { store } from '@/store';
import { Action, Module, Mutation } from '@/store/common/class-modules/decorators';
import { registerModule } from '@/store/common/class-modules/register-module';
import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { persist, PersistModuleSettings } from '@/store/plugins/persist';
import { Persist } from '@/store/plugins/persist/persist-decorator';
import { Store } from 'vuex';

@Module({ namespace: 'ui', modules: [GlobalNavigationStore] })
@Persist({ namespace: 'ui', initMutation: 'SET_STATE', reviver: reviver, transformer: transformer })
export class UIStore extends VuexModule {
    constructor(store: Store<any>) {
        super(store);
    }

    @Action()
    cursorDraggingStart() {
        this.SET_CURSOR_ICON('grabbing');
        this.CURSOR_DRAGGING(true);
    }

    @Action()
    cursorDraggingStop() {
        this.RESET_CURSOR_ICON();
        this.CURSOR_DRAGGING(false);
    }

    @Mutation()
    SET_STATE(s: UserInterface) {
        this.state = s;
    }

    @Mutation()
    SET_CURSOR_ICON(icon: string) {
        this.state.cursor.icon = icon;
    }

    @Mutation()
    RESET_CURSOR_ICON() {
        this.state.cursor.icon = 'pointer';
    }

    @Mutation()
    CURSOR_DRAGGING(dragging?: boolean) {
        this.state.cursor.dragging = dragging;
    }
}

export const uiStore = registerModule<UIStore>(UIStore, store);

export function reviver(s: any) {
    s.globalNavigation.notebooks.input = {};
    s.globalNavigation.tags.input = {};
    s.localNavigation.notes.input = {};

    if (s.editor.mode == null) {
        s.editor.mode = 'view';
    }

    return s;
}

export function transformer(s: any) {
    delete s.globalNavigation.notebooks.input;
    delete s.globalNavigation.notebooks.dragging;
    delete s.globalNavigation.tags.input;

    delete s.localNavigation.notes.input;

    delete s.cursor;

    delete s.editor.tabs.dragging;

    for (let i = 0; i < s.editor.tabs.values.length; i++) {
        delete s.editor.tabs.values[i].tagDropdownActive;
        delete s.editor.tabs.values[i].notebookDropdownActive;
    }

    return s;
}
