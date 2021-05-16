import { Editor } from '@/store/modules/app/modules/editor/state';
import { generateId } from '@/utils/id';
import { MutationTree } from 'vuex';

export const mutations: MutationTree<Editor> = {
    ACTIVE(s, tabId) {
        s.activeTab = tabId;
    },
    EXIT_PREVIEW(s, tabId) {
        const tab = s.tabs.find((t) => t.id === tabId);

        if (tab != null) {
            tab.state = 'normal';
        }
    },
    OPEN_TAB(s, { noteId, content, preview = true }: { noteId: string; content: string; preview: boolean }) {
        // See if we haven't already opened this tab.
        const existing = s.tabs.find((t) => t.noteId === noteId);
        if (existing != null) {
            // Switch it to normal if it was in preview.
            if (existing.state === 'preview') {
                existing.state = 'normal';
            }

            s.activeTab = existing.id;
            return;
        }

        // If we're opening a new preview tab, remove any existing ones. Only 1 can be open a time.
        if (preview) {
            s.tabs = s.tabs.filter((t) => t.state !== 'preview');
        }

        const newTabId = generateId();
        s.tabs.push({
            id: newTabId,
            content,
            noteId,
            state: preview ? 'preview' : 'normal'
        });

        // Set newly opened tab to active
        s.activeTab = newTabId;
    },
    CLOSE_TAB(s, tabId) {
        const tabIndex = s.tabs.findIndex((t) => t.id === tabId);

        if (tabIndex !== -1) {
            s.tabs.splice(tabIndex, 1);
        }
    },
    CLOSE_ALL_TABS(s) {
        s.tabs.length = 0;
    }
};
