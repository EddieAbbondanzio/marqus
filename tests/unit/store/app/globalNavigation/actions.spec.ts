import { actions } from '@/store/modules/app/modules/global-navigation/actions';

describe('GlobalNavigation Actions', () => {
    let context: { commit: jest.Mock };

    beforeEach(() => {
        context = {
            commit: jest.fn()
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

            expect(context.commit.mock.calls).toHaveLength(2);
            expect(context.commit.mock.calls[0][0]).toBe('TAG_INPUT_CONFIRM');
        });

        it('sorts tags', () => {
            (actions.tagInputConfirm as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(2);
            expect(context.commit.mock.calls[1][0]).toBe('TAGS_SORT');
        });
    });

    describe('tagInputCancel', () => {
        it('cancels', () => {
            (actions.tagInputCancel as Function)(context);

            expect(context.commit.mock.calls).toHaveLength(1);
            expect(context.commit.mock.calls[0][0]).toBe('TAG_INPUT_CANCEL');
        });
    });
});
