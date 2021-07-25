import { Notebook } from '@/features/notebooks/common/notebook';
import { NotebookGetters } from '@/features/notebooks/store/getters';
import { NotebookMutations } from '@/features/notebooks/store/mutations';
import { Actions } from 'vuex-smart-module';
import { NotebookState } from './state';

export class NotebookActions extends Actions<NotebookState, NotebookGetters, NotebookMutations, NotebookActions> {
    setExpanded({ notebook, expanded, bubbleUp }: { notebook: Notebook; expanded: boolean; bubbleUp: boolean }) {
        this.commit('SET_EXPANDED', {
            value: {
                notebook,
                expanded,
                bubbleUp
            }
        });
    }
}
