import { NotebookActions } from '@/features/notebooks/store/actions';
import { inject } from 'vuex-smart-module';

describe('Notebook actions', () => {
    describe('setExpanded', () => {
        it('commits', () => {
            const commit = jest.fn();
            const actions = inject(NotebookActions, {
                commit
            });

            const notebook = {
                id: '1',
                name: 'foo'
            };

            actions.setExpanded({ notebook, expanded: true, bubbleUp: false });

            expect(commit).toHaveBeenCalledWith('SET_EXPANDED', {
                value: { notebook, expanded: true, bubbleUp: false }
            });
        });
    });
});
