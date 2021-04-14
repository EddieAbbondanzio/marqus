// window.require = require;

// import EditorToolbar from '@/components/Editor/EditorToolbar.vue';
// import { mount } from '@vue/test-utils';
// import { ActionTree, createStore, MutationTree, Store } from 'vuex';

// describe('EditorToolbar.vue', () => {
//     let mutations: MutationTree<any>;
//     let actions: ActionTree<any, any>;
//     let store: Store<any>;

//     beforeEach(() => {
//         mutations = {
//             'editor/toggleMode': jest.fn()
//         };

//         // actions = {
//             'editor/save': jest.fn()
//         };

//         store = createStore({
//             mutations,
//             actions
//         });
//     });

//     it('edit button toggles mode when clicked', () => {
//         const wrapper = mount(EditorToolbar, {
//             global: {
//                 plugins: [store]
//             }
//         });

//         wrapper.find('#editButton').trigger('click');

//         expect(mutations['editor/toggleMode']).toBeCalled();
//         expect(actions['editor/save']).toBeCalled();
//     });
// });
