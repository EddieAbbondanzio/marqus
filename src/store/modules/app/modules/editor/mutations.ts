import { Editor, EditorMode, Tab } from '@/store/modules/app/modules/editor/state';
import { generateId, getEntity } from '@/store/core/entity';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<Editor> = {
    ACTIVE(s, tabId) {
        s.tabs.active = tabId;
    },
    TAB_CONTENT(s, { id, content }: { id: string; content: string }) {
        const tab = getEntity<Tab>(id, (id) => s.tabs.values.find((t) => t.id === id), 'Tab');
        tab.content = content;
    },
    EXIT_PREVIEW(s, tabId) {
        const tab = s.tabs.values.find((t) => t.id === tabId);

        if (tab != null) {
            tab.state = 'normal';
        }
    },
    OPEN_TAB(s, { noteId, content, preview = true }: { noteId: string; content: string; preview: boolean }) {
        // See if we haven't already opened this tab.
        const existing = s.tabs.values.find((t) => t.noteId === noteId);
        if (existing != null) {
            // Switch it to normal if it was in preview.
            if (existing.state === 'preview' && s.tabs.active === existing.id) {
                existing.state = 'normal';
            }

            s.tabs.active = existing.id;
            return;
        }

        let tab: Tab = {
            id: generateId(),
            content,
            noteId,
            state: preview ? 'preview' : 'normal'
        };

        const existingPreviewTab = s.tabs.values.findIndex((t) => t.state === 'preview');

        // When opening a new preview tab, and one already exists, replace it.
        if (preview && existingPreviewTab !== -1) {
            s.tabs.values.splice(existingPreviewTab, 1, tab);
        } else {
            s.tabs.values.push(tab);
        }

        // Set newly opened tab to active
        s.tabs.active = tab.id;
    },
    SWITCH_TAB(s, id: string) {
        const tab = s.tabs.values.find((t) => t.id === id);

        if (tab == null) {
            console.log(s.tabs.values);
            throw Error(`No tab found with id ${id}`);
        }

        // When active tab is preview, and they click it again. Assume they want to switch to normal mode.
        if (tab.state === 'preview' && s.tabs.active === tab.id) {
            tab.state = 'normal';
        }

        s.tabs.active = tab.id;

        delete tab.notebookDropdownActive;
        delete tab.tagDropdownActive;
    },
    CLOSE_TAB(s, tabId) {
        const tabIndex = s.tabs.values.findIndex((t) => t.id === tabId);

        if (tabIndex !== -1) {
            s.tabs.values.splice(tabIndex, 1);
        }

        if (s.tabs.values.length === 0) {
            s.mode = 'readonly';
        }
    },
    CLOSE_ALL_TABS(s) {
        s.tabs.values.length = 0;
    },
    TAB_DRAGGING(s, dragging?: Tab) {
        s.tabs.dragging = dragging;
    },
    TAB_DRAGGING_NEW_INDEX(s, newIndex: number) {
        if (s.tabs.dragging == null) {
            throw Error('No dragging tab to update.');
        }

        const oldIndex = s.tabs.values.findIndex((t) => t.id === s.tabs.dragging!.id);

        // Remove tab from old spot
        const tab = s.tabs.values.splice(oldIndex, 1)[0];

        // Insert it in at the new one.
        s.tabs.values.splice(newIndex, 0, tab);
    },
    TAG_DROPDOWN_ACTIVE(s, { id, active }: { id: string; active: boolean }) {
        const tab = s.tabs.values.find((t) => t.id === id);

        if (tab == null) {
            throw Error(`No tag found with id ${id}`);
        }

        tab.tagDropdownActive = active;

        // Only allow one drop down active a atime.
        if (active) {
            tab.notebookDropdownActive = false;
        }
    },
    NOTEBOOK_DROPDOWN_ACTIVE(s, { id, active }: { id: string; active: boolean }) {
        const tab = s.tabs.values.find((t) => t.id === id);

        if (tab == null) {
            throw Error(`No tag found with id ${id}`);
        }

        tab.notebookDropdownActive = active;

        // Only allow one drop down active a atime.
        if (active) {
            tab.tagDropdownActive = false;
        }
    },
    MODE(s, m: EditorMode) {
        if (m == null) {
            throw Error(`Mode cannot be null`);
        }

        s.mode = m;
    }
};
