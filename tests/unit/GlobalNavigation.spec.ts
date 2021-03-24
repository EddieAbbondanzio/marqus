window.require = require;

import GlobalNavigation from '@/components/GlobalNavigation.vue';
import { EditorState } from '@/store/modules/editor/editor';
import { mount } from '@vue/test-utils';
import { ActionTree, createStore, MutationTree, Store } from 'vuex';

describe('GlobalNavigation.vue', () => {
    let mutations: MutationTree<any>;
    let actions: ActionTree<any, any>;
    let state: EditorState;
    let store: Store<any>;

    beforeEach(() => {
        mutations = {
            update: jest.fn()
        };

        actions = {
            saveState: jest.fn()
        };

        state = {
            'window.globalNavigation.width': '100px'
        } as any;

        store = createStore({
            modules: {
                editor: {
                    namespaced: true,
                    mutations,
                    actions,
                    state
                }
            }
        });
    });

    it('triggers save on resizeStop', async () => {
        const wrapper = mount(GlobalNavigation, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.find('.resizable-handle').trigger('mousedown');
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(actions.saveState).toBeCalled();
    });
});
