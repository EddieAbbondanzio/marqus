import { actions } from '@/store/modules/app/modules/global-navigation/actions';

describe('GlobalNavigation Actions', () => {
    const context = {
        state: {
            tags: {
                input: {
                    mode: 'create'
                },
                entries: []
            }
        },
        rootState: {
            tags: {
                values: []
            }
        }
    };

    describe('tagInputStart', () => {
        it('triggers input start, and expands tags section', () => {
            expectAction(actions.tagInputStart, null, context, ['TAG_INPUT_START', 'TAGS_EXPANDED']);
        });
    });

    describe('tagInputConfirm', () => {
        it('on create triggers create tag, sorts, and saves', () => {
            expectAction(actions.tagInputConfirm, null, context, [
                'tags/CREATE',
                'TAG_INPUT_CLEAR',
                'tags/SORT',
                'DIRTY'
            ]);
        });

        it('on update triggers update tag, sorts, and saves', () => {
            context.state.tags.input.mode = 'update';

            expectAction(actions.tagInputConfirm, null, context, [
                'tags/UPDATE',
                'TAG_INPUT_CLEAR',
                'tags/SORT',
                'DIRTY'
            ]);
        });
    });

    describe('tagInputCancel', () => {
        it('cancels', () => {
            expectAction(actions.tagInputCancel, null, context, ['TAG_INPUT_CLEAR']);
        });
    });
});
