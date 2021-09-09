import { tags } from '@/features/tags/store';

describe('Tag vuex module', () => {
    it('is namespaced', () => {
        expect(tags.options.namespaced).toBeTruthy();
    });
});
