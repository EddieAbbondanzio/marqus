import { fixNotebookParentReferences, fullyQualify, Notebook } from '@/features/notebooks/shared/notebook';
import { generateId } from '@/store';

describe('fixNotebookParentReferences()', () => {
    it('can handle null children', () => {
        const n: Notebook = {
            id: '1',
            name: 'cat',
            expanded: false
        };

        expect(() => fixNotebookParentReferences(n)).not.toThrow();
    });

    it('can handle no children', () => {
        const n: Notebook = {
            id: '1',
            name: 'cat',
            expanded: false,
            children: []
        };

        expect(() => fixNotebookParentReferences(n)).not.toThrow();
    });

    it('will set .parent for children', () => {
        const n: Notebook = {
            id: '1',
            name: 'cat',
            expanded: false,
            children: [
                { id: '2', name: 'dog', expanded: false },
                { id: '3', name: 'horse', expanded: false }
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
            name: 'name'
        };

        expect(fullyQualify(n as any)).toBe('name');
    });

    it('returns nested', () => {
        const parent = {
            name: 'parent'
        };

        const child = {
            name: 'child',
            parent
        };

        expect(fullyQualify(child as any)).toBe('parent/child');
    });
});
