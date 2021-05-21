import { actions } from '@/store/modules/app/modules/editor/actions';

describe('Editor actions', () => {
    describe('tabSwitch', () => {
        it('sets active, and reset old tab.', async () => {
            await expectAction(
                actions.tabSwitch,
                null,
                {
                    state: {
                        tabs: {
                            values: []
                        }
                    }
                },
                ['ACTIVE', 'RESET_TAB']
            );
        });
    });
});
