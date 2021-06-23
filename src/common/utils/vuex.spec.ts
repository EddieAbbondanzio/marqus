import { splitMutationAndNamespace } from '@/shared/utils/vuex';

describe('splitMutationAndNamespace()', () => {
    it('handles root mutation', () => {
        const [n, m] = splitMutationAndNamespace('APPLY');
        expect(n).toBe('');
        expect(m).toBe('APPLY');
    });

    it('handles namespaced mutation', () => {
        const [n, m] = splitMutationAndNamespace('namespace/APPLY');

        expect(n).toBe('namespace');
        expect(m).toBe('APPLY');
    });

    it('handles nested namespace mutation', () => {
        const [n, m] = splitMutationAndNamespace('namespace/nested/APPLY');
        expect(n).toBe('namespace/nested');
        expect(m).toBe('APPLY');
    });
});
