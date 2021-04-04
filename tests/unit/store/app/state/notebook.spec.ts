import { Notebook } from '@/store/modules/app/state/notebook';

describe('Notebook {}', () => {
    describe('toggleExpanded()', () => {
        it('sets false to true', () => {
            const n = new Notebook('1', 'Value');
            n.toggleExpanded();

            expect(n.expanded).toBeTruthy();
        });

        it('sets true to false', () => {
            const n = new Notebook('1', 'Value', true);
            n.toggleExpanded();

            expect(n.expanded).toBeFalsy();
        });
    });

    describe('findNotebook()', () => {
        it('returns the notebook it was called on if id matches', () => {
            const n = new Notebook('1', 'Value');
            const match = n.findNotebook('1');

            expect(match).toBe(n);
        });

        it('returns null if no match, and no children', () => {
            const n = new Notebook('1', 'Value');
            const match = n.findNotebook('2');

            expect(match).toBeNull();
        });

        it('returns match found in child', () => {
            const n = new Notebook('1', 'Value', false, null, [new Notebook('2', 'Value')]);
            const match = n.findNotebook('2');

            expect(match?.id).toBe('2');
        });
    });

    describe('addChild()', () => {
        it('adds child to children array', () => {
            const n = new Notebook('1', 'Value');
            n.addChild(new Notebook('2', 'Value'));

            expect(n.children).toHaveLength(1);
        });

        it('sets new parent', () => {
            const n = new Notebook('1', 'Value');
            n.addChild(new Notebook('2', 'Value'));

            expect(n.children![0].parent).toBe(n);
        });
    });

    describe('removeChild()', () => {
        it('removes parent from child', () => {
            const n = new Notebook('1', 'Value');
            const c = new Notebook('2', 'Value');

            n.addChild(c);
            n.removeChild(c);

            expect(c.parent).toBeNull();
        });

        it('removes child from children array', () => {
            const n = new Notebook('1', 'Value');
            const c = new Notebook('2', 'Value');

            n.addChild(c);
            n.removeChild(c);

            expect(n.children).toHaveLength(0);
        });
    });
});
