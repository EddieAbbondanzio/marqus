import { generateId } from '@/store';
import { Editor } from '@/features/ui/store/modules/editor/state';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<Editor> = {};

// export function apply(state: Editor, event: EditorEvent) {
//     let tab: Tab | undefined;
//     let index: number | undefined;
//     let existing: Tab | undefined;
//     let existingPreviewTabIndex: number;

//     switch (event.type) {
//         case 'activeUpdated':
//             state.tabs.active = event.newValue;
//             break;

//         case 'editorModeUpdated':
//             state.mode = event.newValue;
//             break;

//         case 'notebookDropdownActiveUpdated':
//             tab = state.tabs.values.find((t) => t.id === state.tabs.active);

//             if (tab == null) {
//                 throw Error(`No active tab.`);
//             }

//             tab.notebookDropdownActive = event.newValue;
//             break;

//         case 'tagDropdownActiveUpdated':
//             tab = state.tabs.values.find((t) => t.id === state.tabs.active);

//             if (tab == null) {
//                 throw Error(`No active tab.`);
//             }

//             tab.tagDropdownActive = event.newValue;
//             break;

//         case 'tabContentUpdated':
//             tab = state.tabs.values.find((t) => t.id === state.tabs.active);

//             if (tab == null) {
//                 throw Error(`No active tab.`);
//             }

//             tab.content = event.newValue;
//             tab.state = 'dirty';
//             break;

//         case 'tabStateUpdated':
//             tab = state.tabs.values.find((t) => t.id === state.tabs.active);

//             if (tab == null) {
//                 throw Error(`No active tab.`);
//             }

//             tab.state = event.newValue;
//             break;

//         case 'tabClosed':
//             index = state.tabs.values.findIndex((t) => t.id === event.id);

//             if (index !== -1) {
//                 state.tabs.values.splice(index, 1);
//             }

//             // If there is no tabs left open, switch the editor out of edit mode.
//             if (state.tabs.values.length === 0) {
//                 state.mode = 'readonly';
//             }
//             break;

//         case 'tabsCloseAll':
//             state.tabs.values.length = 0;
//             state.tabs.active = undefined;
//             break;

//         case 'tabDraggingUpdated':
//             if (event.newValue == null) {
//                 state.tabs.dragging = undefined;
//             } else {
//                 state.tabs.dragging = state.tabs.values.find((t) => t.id === event.newValue);
//             }
//             break;

//         case 'tabDraggingIndexUpdated':
//             if (state.tabs.dragging == null) {
//                 throw Error('No dragging tab to update.');
//             }

//             index = state.tabs.values.findIndex((t) => t.id === state.tabs.dragging!.id);

//             // Remove tab from old spot
//             tab = state.tabs.values.splice(index, 1)[0];

//             // Insert it in at the new one.
//             state.tabs.values.splice(event.newValue, 0, tab);
//             break;

//         case 'tabOpened':
//             // See if we haven't already opened this tab.
//             existing = state.tabs.values.find((t) => t.noteId === event.noteId);
//             if (existing != null) {
//                 // Switch it to normal if it was in preview.
//                 if (existing.state === 'preview' && state.tabs.active === existing.id) {
//                     existing.state = 'normal';
//                 }

//                 state.tabs.active = existing.id;
//                 return;
//             }

//             tab = {
//                 id: generateId(),
//                 content: event.content,
//                 noteId: event.noteId,
//                 state: event.preview ? 'preview' : 'normal'
//             };

//             existingPreviewTabIndex = state.tabs.values.findIndex((t) => t.state === 'preview');

//             // When opening a new preview tab, and one already exists, replace it.
//             if (event.preview && existingPreviewTabIndex !== -1) {
//                 state.tabs.values.splice(existingPreviewTabIndex, 1, tab);
//             } else {
//                 state.tabs.values.push(tab);
//             }

//             // Set newly opened tab to active
//             state.tabs.active = tab.id;

//             delete tab.notebookDropdownActive;
//             delete tab.tagDropdownActive;
//     }
// }
