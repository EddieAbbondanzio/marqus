import { State } from '@/store/state';
import { mount } from '@vue/test-utils';
import { ActionTree, createStore, GetterTree, MutationTree, Store } from 'vuex';
import GlobalNavigationTagSection from '@/components/global-navigation/GlobalNavigationTagSection.vue';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';
import { defineRule } from 'vee-validate';

describe('GlobalNavigationTagSection.vue', () => {
    let store: Store<any>;
    let mutations: MutationTree<any>;

    // Vee-validate rules used by tag form
    defineRule('required', jest.fn());
    defineRule('unique', jest.fn());

    beforeEach(() => {
        mutations = {
            TAGS_EXPANDED: jest.fn(),
            TAG_INPUT_VALUE: jest.fn(),
            TEST_TAG_INPUT_MODE: (s, mode) => (s.tags.input.mode = mode)
        };

        store = createStore({
            state: {
                notebooks: {
                    values: []
                },
                notes: {
                    values: []
                }
            },
            modules: {
                app: {
                    namespaced: true,
                    state: {
                        cursor: {
                            icon: 'default'
                        }
                    },
                    modules: {
                        globalNavigation: {
                            namespaced: true,
                            mutations,
                            actions: {
                                tagInputConfirm: jest.fn(),
                                tagInputCancel: jest.fn()
                            },
                            getters: {
                                isTagBeingUpdated: () => jest.fn(),
                                isTagBeingCreated: (s) => s.tags.input.mode === 'create',
                                indentation: () => jest.fn(),
                                isActive: () => jest.fn()
                            },
                            state: {
                                width: '100px',
                                notebooks: { expanded: true, input: {} },
                                tags: { expanded: true, input: {} }
                            }
                        }
                    }
                },
                tags: {
                    namespaced: true,
                    state: {
                        values: []
                    },
                    mutations: {
                        TEST_INSERT: (s, t) => s.values.push(t)
                    }
                }
            }
        });
    });

    it('toggles expand collapse on section from anywhere', () => {
        const wrapper = mount(GlobalNavigationTagSection, {
            global: {
                plugins: [store]
            }
        });

        const section = wrapper.find('#global-navigation-tag-section > a');
        section.trigger('click');

        expect(mutations.TAGS_EXPANDED).toHaveBeenCalled();
    });

    it('displays create form if tag is being created', async () => {
        const wrapper = mount(GlobalNavigationTagSection, {
            global: {
                plugins: [store],
                directives: {
                    focus: jest.fn()
                }
            }
        });

        store.commit('app/globalNavigation/TEST_TAG_INPUT_MODE', 'create');

        await wrapper.vm.$nextTick();

        const form = wrapper.find('#global-navigation-tag-create-form');
        expect(form.exists()).toBeTruthy();
    });

    it('renders tags', async () => {
        const wrapper = mount(GlobalNavigationTagSection, {
            global: {
                plugins: [store],
                directives: {
                    focus: jest.fn()
                }
            }
        });

        store.commit('tags/TEST_INSERT', { id: '1', value: 'Cat' });

        await wrapper.vm.$nextTick();

        const tag = wrapper.find('.global-navigation-tag');
        expect(tag.exists());

        const span = tag.find('.navigation-menu-item-label');
        expect(span.element.innerHTML).toBe('Cat');
    });
});
