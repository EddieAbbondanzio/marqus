import { actions } from '@/store/modules/app/modules/global-navigation/actions';

describe('GlobalNavigation Actions', () => {
    let context: { commit: jest.Mock; rootState: {}; state: {} };

    beforeEach(() => {
        context = {
            commit: jest.fn(),
            state: {
                tags: {
                    input: {
                        mode: 'create'
                    }
                }
            },
            rootState: {
                tags: []
            }
        };
    });

    describe('tagInputStart', () => {
        it('triggers input start', () => {
            (actions.tagInputStart as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(2);
            expect(context.commit.mock.calls[0][0]).toBe('TAG_INPUT_START');
        });

        it('expands tags section', () => {
            (actions.tagInputStart as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(2);
            expect(context.commit.mock.calls[1][0]).toBe('TAGS_EXPANDED');
        });
    });

    describe('tagInputConfirm', () => {
        it('saves off the input', () => {
            (actions.tagInputConfirm as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(4);
            expect(context.commit.mock.calls[0][0]).toBe('tags/CREATE');
        });

        it('sorts tags', () => {
            (actions.tagInputConfirm as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(4);
            expect(context.commit.mock.calls[3][0]).toBe('TAGS_SORT');
        });
    });

    describe('tagInputCancel', () => {
        it('cancels', () => {
            (actions.tagInputCancel as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(1);
            expect(context.commit.mock.calls[0][0]).toBe('TAG_INPUT_CLEAR');
        });
    });
});
