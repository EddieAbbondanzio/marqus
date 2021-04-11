import { mutations } from '@/store/modules/app/modules/global-navigation/mutations';
import { GlobalNavigation } from '@/store/modules/app/modules/global-navigation/state';

describe('GlobalNavigation mutations', () => {
    describe('SET_TAGS_EXPANDED', () => {
        let state: GlobalNavigation;

        beforeEach(() => {
            state = {
                notebooks: {
                    expanded: false,
                    input: {},
                    entries: []
                },
                tags: {
                    expanded: false,
                    input: {},
                    entries: []
                },
                width: '100px'
            };
        });

        it('assigns tags.expanded to the parameter.', () => {
            mutations.SET_TAGS_EXPANDED(state, true);
            expect(state.tags.expanded).toBeTruthy();
        });

        it('defaults to true', () => {
            mutations.SET_TAGS_EXPANDED(state);
            expect(state.tags.expanded).toBeTruthy();
        });
    });
});
