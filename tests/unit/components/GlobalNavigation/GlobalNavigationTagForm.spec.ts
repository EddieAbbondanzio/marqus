import GlobalNavigationTagForm from '@/components/global-navigation/GlobalNavigationTagForm.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { ActionTree, createStore, MutationTree, Store } from 'vuex';
import { focus } from '@/directives/focus';
import { GlobalNavigation, GlobalNavigationNotebookSection } from '@/store/modules/app/modules/global-navigation/state';
import '@/plugins/vee-validate';

describe('GlobalNavigationTagForm', () => {
    let mutations: MutationTree<any>;
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

        store = createStore({
            modules: {
                app: {
                    namespaced: true,
                    modules: {
                        globalNavigation: {
                            namespaced: true,
                            mutations,
                            actions,
                            state
                        }
                    }
                },
                tags: {
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
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#tagValue');
        input.trigger('keyup', { key: 'escape' });

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('emits cancel on cancel button click', () => {
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const button = wrapper.find('#cancelButton');
        button.trigger('click');

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('shows error if duplicate tag name', async () => {
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#tagValue');
        input.setValue('cat');

        await flushPromises();

        const errorMessage = wrapper.find('#errorMessage');
        expect(errorMessage.exists()).toBeTruthy();
    });

    it('supports initial value via modelValue', () => {
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            },
            props: {
                modelValue: 'cat'
            }
        });

        const input = wrapper.find('#tagValue');
        expect((<HTMLInputElement>input.element).value).toBe('cat');
    });

    it('updates modelValue', () => {
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            },
            props: {
                modelValue: 'cat'
            }
        });

        const input = wrapper.find('#tagValue');
        input.setValue('catdog');
        expect((<HTMLInputElement>input.element).value).toBe('catdog');
    });

    it('cancels input when blurred and value is empty', () => {
        const wrapper = mount(GlobalNavigationTagForm, {
            global: {
                plugins: [store],
                directives: { focus }
            }
        });

        const input = wrapper.find('#tagValue');
        input.trigger('blur');

        expect(wrapper.emitted('cancel')).toBeTruthy();
    });
});
