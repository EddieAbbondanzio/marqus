import { fixNotebookParentReferences } from '@/store/modules/notebooks';
import { Notebook } from '@/store/modules/notebooks/state';

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
