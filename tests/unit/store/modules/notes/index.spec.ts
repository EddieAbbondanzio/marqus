import { deserialize } from '@/store/modules/notes';
import { fileSystem } from '@/utils/file-system';

describe('notes store', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('deserialize()', () => {
        it('reads directories', async () => {
            fileSystem.readDirectory = async (p, opts) => ['7d843d87-c3fa-47db-8858-42513ecbc7ba'];
            fileSystem.readJSON = async (p, opts) => ({
                name: 'cat',
                dateCreated: new Date().toString(),
                dateModified: new Date().toString(),
                notebooks: ['1', '2'],
                tags: ['3', '4']
            });
            const notes = await deserialize();
            expect(notes.values).toHaveLength(1);
            expect(notes.values[0].name).toBe('cat');
            expect(notes.values[0].dateCreated).toBeInstanceOf(Date);
            expect(notes.values[0].dateModified).toBeInstanceOf(Date);
            expect(notes.values[0].notebooks).toEqual(['1', '2']);
            expect(notes.values[0].tags).toEqual(['3', '4']);
        });
    });
});
