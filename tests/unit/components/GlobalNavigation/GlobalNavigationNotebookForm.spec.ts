import GlobalNavigationNotebookForm from '@/components/GlobalNavigation/GlobalNavigationNotebookForm.vue';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { flushPromises, mount } from '@vue/test-utils';
import { MutationTree, ActionTree, Store, createStore, GetterTree } from 'vuex';

describe('GlobalNavigationNotebookForm.vue', () => {
    window.focus = jest.fn();

    let mutations: MutationTree<any>;
    let getters: GetterTree<any, any>;
    let actions: ActionTree<any, any>;
    let state: GlobalNavigation;
    let store: Store<any>;

    beforeEach(() => {
        state = {
            width: '100px',
            notebooks: {
                expanded: true,
                input: {}
            },
            tags: {
                expanded: true,
                input: {}
            }
        };

        getters = {
            notebookDepth: (s: any) => (n: any) => 1,
            indentation: (s: any) => (a: any) => '24px'
        };

        store = createStore({
            modules: {
                app: {
                    namespaced: true,
                    modules: {
                        globalNavigation: {
                            namespaced: true,
                            mutations,
                            actions,
                            state,
                            getters
                        }
                    }
                },
                notebooks: {
                    namespaced: true,
                    state: {
                        values: [
                            {
                                id: '1',
                                value: 'cat'
                            }
                        ]
                    }
                }
            }
        });
    });

    it('emits cancel on escape', () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#notebookValue');
        input.trigger('keyup', { key: 'escape' });

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits cancel on cancel button click', () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const button = wrapper.find('#cancelButton');
        button.trigger('click');

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('shows error if duplicate notebook name', async () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#notebookValue');
        input.setValue('cat');

        await flushPromises();

        const errorMessage = wrapper.find('#errorMessage');
        expect(errorMessage.exists()).toBeTruthy();
    });

    it('sets initial value from modelValue', () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            },
            props: {
                modelValue: 'cat'
            }
        });

        const input = wrapper.find('#notebookValue');
        expect((<HTMLInputElement>input.element).value).toBe('cat');
    });

    it('updates modelValue', () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            },
            props: {
                modelValue: 'cat'
            }
        });

        const input = wrapper.find('#notebookValue');
        input.setValue('catdog');
        expect((<HTMLInputElement>input.element).value).toBe('catdog');
    });

    it('cancels input when burred and value is empty', () => {
        const wrapper = mount(GlobalNavigationNotebookForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#notebookValue');
        input.trigger('blur');

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });
});
