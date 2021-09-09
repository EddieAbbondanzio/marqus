import {
    findNotebookRecursive,
    fixNotebookParentReferences,
    fullyQualify,
    Notebook
} from '@/features/notebooks/shared/notebook';
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

describe('findNotebookRecursive()', () => {
    const notebooks = [
        {
            id: generateId(),
            value: 'horse',
            expanded: false,
            children: [
                { id: generateId(), value: 'correct', expanded: false },
                { id: generateId(), value: 'battery', expanded: false },
                { id: generateId(), value: 'staple', expanded: false }
            ]
        }
    ];

    it('returns nothing if no notebooks passed', () => {
        const match = findNotebookRecursive(null!, '1');
        expect(match).toBeUndefined();
    });

    it('can find a root match', () => {
        const match = findNotebookRecursive(notebooks, notebooks[0].id);
        expect(match).toHaveProperty('id', notebooks[0].id);
    });

    it('can find a nested notebook', () => {
        const match = findNotebookRecursive(notebooks, notebooks[0].children[2].id);
        expect(match).toHaveProperty('id', notebooks[0].children[2].id);
    });

    it('returns nothing if no match found after searching', () => {
        const match = findNotebookRecursive(notebooks, '1');
        expect(match).toBeUndefined();
    });
});
