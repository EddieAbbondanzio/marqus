import { fixNotebookParentReferences, fullyQualify, Notebook } from '@/features/notebooks/common/notebook';

describe('fixNotebookParentReferences()', () => {
    it('can handle null children', () => {
        const n: Notebook = {
            id: '1',
            value: 'cat',
            expanded: false
        };

        expect(() => fixNotebookParentReferences(n)).not.toThrow();
    });

    it('can handle no children', () => {
        const n: Notebook = {
            id: '1',
            value: 'cat',
            expanded: false,
            children: []
        };

        expect(() => fixNotebookParentReferences(n)).not.toThrow();
    });

    it('will set .parent for children', () => {
        const n: Notebook = {
            id: '1',
            value: 'cat',
            expanded: false,
            children: [
                { id: '2', value: 'dog', expanded: false },
                { id: '3', value: 'horse', expanded: false }
            ]
        };

        fixNotebookParentReferences(n);
        expect(n.children![0].parent).toBe(n);
        expect(n.children![1].parent).toBe(n);
    });
});

describe('fullyQualify()', () => {
    it('returns root', () => {
        const n = {
            value: 'name'
        };

        expect(fullyQualify(n as any)).toBe('name');
    });

    it('returns nested', () => {
        const parent = {
            value: 'parent'
        };

        const child = {
            value: 'child',
            parent
        };

        expect(fullyQualify(child as any)).toBe('parent/child');
    });
});
