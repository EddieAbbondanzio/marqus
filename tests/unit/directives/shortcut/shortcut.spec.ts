import { KeyCode } from '@/directives/shortcut/key-code';
import { Shortcut } from '@/directives/shortcut/shortcut';

describe('Shortcut {}', () => {
    describe('ctor', () => {
        it('throws if no keys', () => {
            expect(() => {
                new Shortcut('', []);
            }).toThrow();
        });

        it('throws if duplicate keys', () => {
            expect(() => {
                new Shortcut('', [KeyCode.LetterX, KeyCode.LetterX]);
            }).toThrow();
        });

        it('sets modifiers first', () => {
            const s = new Shortcut('', [KeyCode.LetterW, KeyCode.Shift, KeyCode.Alt, KeyCode.Control]);

            expect(s.keys[0]).toBe(KeyCode.Control);
            expect(s.keys[1]).toBe(KeyCode.Shift);
            expect(s.keys[2]).toBe(KeyCode.Alt);
            expect(s.keys[3]).toBe(KeyCode.LetterW);
        });
    });

    describe('isMatch()', () => {
        it('returns true when keys match', () => {
            const a = new Shortcut('', [KeyCode.Shift, KeyCode.LetterU]);

            const isMatch = a.isMatch([KeyCode.Shift, KeyCode.LetterU]);

            expect(isMatch).toBeTruthy();
        });

        it('can have out of order keys', () => {
            const a = new Shortcut('', [KeyCode.Shift, KeyCode.LetterU]);

            const isMatch = a.isMatch([KeyCode.LetterU, KeyCode.Shift]);

            expect(isMatch).toBeTruthy();
        });

        it('returns false if not match', () => {
            const a = new Shortcut('', [KeyCode.Shift, KeyCode.LetterU]);

            const isMatch = a.isMatch([KeyCode.LetterU, KeyCode.Shift, KeyCode.ArrowLeft]);

            expect(isMatch).toBeFalsy();
        });
    });

    describe('toString()', () => {
        it('makes readable strings', () => {
            const s = new Shortcut('', [KeyCode.LetterW, KeyCode.Shift, KeyCode.Alt, KeyCode.Control]);
            expect(s.toString()).toBe('control+shift+alt+w');
        });
    });
});
