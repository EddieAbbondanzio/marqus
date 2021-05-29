import { unique } from '@/plugins/vee-validate/rules/unique';

describe('unique()', () => {
    it('returns true if value is null', () => {
        var res = unique(null, [
            () => ['a', 'b', 'c'],
            (v) => v.id,
            (v) => v.value,
            () => ({
                id: 35
            })
        ]);
        expect(res).toBeTruthy();
    });

    it('returns false if match based off unique property was found', () => {
        const values = [
            { id: '1', value: 'cat' },
            { id: '2', value: 'dog' },
            { id: '3', value: 'horse' }
        ];

        var res = unique('dog', [
            () => values,
            (v) => v.id,
            (v) => v.value,
            () => ({
                id: 35
            })
        ]);
        expect(res).toBeFalsy();
    });

    it('returns true if no match was found', () => {
        const values = [
            { id: '1', value: 'cat' },
            { id: '2', value: 'dog' },
            { id: '3', value: 'horse' }
        ];

        var res = unique('fish', [
            () => values,
            (v) => v.id,
            (v) => v.value,
            () => {
                id: 35;
            }
        ]);
        expect(res).toBeTruthy();
    });

    it('ignores duplicate if entity passed matches', () => {
        const values = [
            { id: '1', value: 'cat' },
            { id: '2', value: 'dog' },
            { id: '3', value: 'horse' }
        ];

        var res = unique('horse', [
            () => values,
            (v) => v.id,
            (v) => v.value,
            () => ({
                id: '3'
            })
        ]);
        expect(res).toBeTruthy();
    });
});
