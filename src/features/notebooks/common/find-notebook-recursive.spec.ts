import { findNotebookRecursive } from '@/features/notebooks/common/find-notebook-recursive';
import { generateId } from '@/store';

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
