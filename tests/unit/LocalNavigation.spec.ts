window.require = require;

import LocalNavigation from '@/components/LocalNavigation.vue';
import { EditorState } from '@/store/modules/editor/editor';
import { mount } from '@vue/test-utils';
import { ActionTree, createStore, MutationTree, Store } from 'vuex';

describe('localNavigation.vue', () => {
    let mutations: MutationTree<any>;
    let actions: ActionTree<any, any>;
    let state: EditorState;
    let store: Store<any>;

    beforeEach(() => {
        mutations = {
            update: jest.fn()
        };

        actions = {
            save: jest.fn()
        };

        state = {
            'window.localNavigation.width': '100px'
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

    it('triggers save on resizeStop', () => {
        const wrapper = mount(LocalNavigation, {
            global: {
                plugins: [store]
            }
        });

        wrapper.find('.resizable-handle').trigger('mousedown');
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(actions.save).toBeCalled();
    });
});
