import { MouseObjectSubscriber } from '@/core/directives/mouse/mouse-object-subscriber';

describe('MouseObjectSubscriber', () => {
    describe('isMatch()', () => {
        it('returns true if action and button match', () => {
            const sub = new MouseObjectSubscriber('click', 'left', () => {});
            expect(sub.isMatch('click', 'left')).toBeTruthy();
        });

        it('returns true if action match and button is either', () => {
            const sub = new MouseObjectSubscriber('click', 'either', () => {});
            expect(sub.isMatch('click', 'left')).toBeTruthy();
        });

        it("returns false if buttons don't match", () => {
            const sub = new MouseObjectSubscriber('click', 'right', () => {});
            expect(sub.isMatch('click', 'left')).toBeFalsy();
        });

        it("returns false if actions don't match", () => {
            const sub = new MouseObjectSubscriber('click', 'right', () => {});
            expect(sub.isMatch('hold', 'left')).toBeFalsy();
        });
    });
});
