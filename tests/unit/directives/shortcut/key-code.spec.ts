import { isModifier, isValidKeyCode, KeyCode, parseKey } from '@/directives/shortcut/key-code';

describe('parseKey()', () => {
    it('returns space', () => {
        expect(parseKey('Space')).toBe('space');
    });

    it('returns escape', () => {
        expect(parseKey('Escape')).toBe('esc');
    });

    it('returns f keys', () => {
        for (let i = 1; i <= 12; i++) {
            expect(parseKey(`F${i}`)).toBe(`f${i}`);
        }
    });

    it('returns insert', () => {
        expect(parseKey('Insert')).toBe('insert');
    });

    it('returns delete', () => {
        expect(parseKey('Delete')).toBe('delete');
    });

    it('returns backquote', () => {
        expect(parseKey('Backquote')).toBe('`');
    });

    it('returns digits', () => {
        for (let i = 0; i <= 9; i++) {
            expect(parseKey(`Digit${i}`)).toBe(i.toString());
        }
    });

    it('returns minus', () => {
        expect(parseKey('Minus')).toBe('-');
    });

    it('returns equal', () => {
        expect(parseKey('Equal')).toBe('=');
    });

    it('returns backspace', () => {
        expect(parseKey('Backspace')).toBe('backspace');
    });

    it('returns tab', () => {
        expect(parseKey('Tab')).toBe('tab');
    });

    it('returns alphabet letters', () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        for (const letter of alphabet) {
            expect(parseKey(`Key${letter}`)).toBe(letter.toLowerCase());
        }
    });

    it('returns left bracket', () => {
        expect(parseKey('BracketLeft')).toBe('[');
    });

    it('returns right bracket', () => {
        expect(parseKey('BracketRight')).toBe(']');
    });

    it('returns back slash', () => {
        expect(parseKey('Backslash')).toBe('\\');
    });

    it('returns caps lock', () => {
        expect(parseKey('CapsLock')).toBe('capslock');
    });

    it('returns semicolon', () => {
        expect(parseKey('Semicolon')).toBe(';');
    });

    it('returns quote', () => {
        expect(parseKey('Quote')).toBe("'");
    });

    it('returns enter', () => {
        expect(parseKey('Enter')).toBe('enter');
    });

    it('returns shift', () => {
        expect(parseKey('ShiftLeft')).toBe('shift');
        expect(parseKey('ShiftRight')).toBe('shift');
    });

    it('returns comma', () => {
        expect(parseKey('Comma')).toBe(',');
    });

    it('returns period', () => {
        expect(parseKey('Period')).toBe('.');
    });

    it('returns slash', () => {
        expect(parseKey('Slash')).toBe('/');
    });

    it('returns control', () => {
        expect(parseKey('ControlLeft')).toBe('ctrl');
        expect(parseKey('ControlRight')).toBe('ctrl');
    });

    it('returns alt', () => {
        expect(parseKey('AltLeft')).toBe('alt');
        expect(parseKey('AltRight')).toBe('alt');
    });

    it('returns arrows', () => {
        expect(parseKey('ArrowUp')).toBe('up');
        expect(parseKey('ArrowDown')).toBe('down');
        expect(parseKey('ArrowLeft')).toBe('left');
        expect(parseKey('ArrowRight')).toBe('right');
    });

    it('returns numpad digits', () => {
        for (let i = 0; i <= 9; i++) {
            expect(parseKey(`Numpad${i}`)).toBe(`numpad${i}`);
        }
    });

    it('returns numpad add', () => {
        expect(parseKey('NumpadAdd')).toBe('numpad_add');
    });

    it('returns numpad subtract', () => {
        expect(parseKey('NumpadSubtract')).toBe('numpad_subtract');
    });

    it('returns numpad multiply', () => {
        expect(parseKey('NumpadMultiply')).toBe('numpad_multiply');
    });

    it('returns numpad divide', () => {
        expect(parseKey('NumpadDivide')).toBe('numpad_divide');
    });

    it('returns numpad_separator', () => {
        expect(parseKey('NumpadSeparator')).toBe('numpad_separator');
    });

    it('returns numpad decimal', () => {
        expect(parseKey('NumpadDecimal')).toBe('numpad_decimal');
    });

    it('returns page up', () => {
        expect(parseKey('PageUp')).toBe('page_up');
    });

    it('returns page down', () => {
        expect(parseKey('PageDown')).toBe('page_down');
    });
});

describe('isModifier()', () => {
    it('returns true for control', () => {
        expect(isModifier(KeyCode.Control)).toBeTruthy();
    });

    it('returns true for alt', () => {
        expect(isModifier(KeyCode.Alt)).toBeTruthy();
    });

    it('returns true for shift', () => {
        expect(isModifier(KeyCode.Shift)).toBeTruthy();
    });

    it('returns false for else', () => {
        expect(isModifier(KeyCode.LetterW)).toBeFalsy();
    });
});

describe('isValidKeyCode()', () => {
    it('returns true for valid key codes', () => {
        expect(isValidKeyCode(KeyCode.LetterX)).toBeTruthy();
    });

    it('returns false for non key codes', () => {
        expect(isValidKeyCode('cat')).toBeFalsy();
    });
});
