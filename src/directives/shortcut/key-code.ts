/**
 * String identifiers of keys.
 */
export enum KeyCode {
    Escape = 'esc',
    F1 = 'f1',
    F2 = 'f2',
    F3 = 'f3',
    F4 = 'f4',
    F5 = 'f5',
    F6 = 'f6',
    F7 = 'f7',
    F8 = 'f8',
    F9 = 'f9',
    F10 = 'f10',
    F11 = 'f11',
    F12 = 'f12',
    Insert = 'insert',
    Delete = 'delete',
    BackQuote = '`',
    Digit1 = '1',
    Digit2 = '2',
    Digit3 = '3',
    Digit4 = '4',
    Digit5 = '5',
    Digit6 = '6',
    Digit7 = '7',
    Digit8 = '8',
    Digit9 = '9',
    Digit0 = '0',
    Minus = '-',
    Equal = '=',
    Backspace = 'backspace',
    Tab = 'tab',
    BracketLeft = '[',
    BracketRight = ']',
    BackSlash = '\\',
    CapsLock = 'capslock',
    Semicolon = ';',
    Quote = "'",
    Enter = 'enter',
    Shift = 'shift',
    Comma = ',',
    Period = '.',
    Slash = '/',
    Control = 'ctrl',
    Meta = 'meta',
    Alt = 'alt',
    ArrowUp = 'up',
    ArrowLeft = 'left',
    ArrowRight = 'right',
    ArrowDown = 'down',
    Space = 'space',
    LetterA = 'a',
    LetterB = 'b',
    LetterC = 'c',
    LetterD = 'd',
    LetterE = 'e',
    LetterF = 'f',
    LetterG = 'g',
    LetterH = 'h',
    LetterI = 'i',
    LetterJ = 'j',
    LetterK = 'k',
    LetterL = 'l',
    LetterM = 'm',
    LetterN = 'n',
    LetterO = 'o',
    LetterP = 'p',
    LetterQ = 'q',
    LetterR = 'r',
    LetterS = 's',
    LetterT = 't',
    LetterU = 'u',
    LetterV = 'v',
    LetterW = 'w',
    LetterX = 'x',
    LetterY = 'y',
    LetterZ = 'z',
    Numpad0 = 'numpad0',
    Numpad1 = 'numpad1',
    Numpad2 = 'numpad2',
    Numpad3 = 'numpad3',
    Numpad4 = 'numpad4',
    Numpad5 = 'numpad5',
    Numpad6 = 'numpad6',
    Numpad7 = 'numpad7',
    Numpad8 = 'numpad8',
    Numpad9 = 'numpad9',
    NumpadMultiply = 'numpad_multiply',
    NumpadAdd = 'numpad_add',
    NumpadSubtract = 'numpad_subtract',
    NumpadSeparator = 'numpad_separator',
    NumpadDivide = 'numpad_divide',
    NumpadDecimal = 'numpad_decimal',
    PageDown = 'page_down',
    PageUp = 'page_up'
}

/*
 * Convert the native code from KeyboardEvent.code into our key identifier.
 */
export function parseKey(code: string): KeyCode {
    switch (code) {
        case 'Space':
            return KeyCode.Space;
        case 'Escape':
            return KeyCode.Escape;
        case 'F1':
            return KeyCode.F1;
        case 'F2':
            return KeyCode.F2;
        case 'F3':
            return KeyCode.F3;
        case 'F4':
            return KeyCode.F4;
        case 'F5':
            return KeyCode.F5;
        case 'F6':
            return KeyCode.F6;
        case 'F7':
            return KeyCode.F7;
        case 'F8':
            return KeyCode.F8;
        case 'F9':
            return KeyCode.F9;
        case 'F10':
            return KeyCode.F10;
        case 'F11':
            return KeyCode.F11;
        case 'F12':
            return KeyCode.F12;
        case 'Insert':
            return KeyCode.Insert;
        case 'Delete':
            return KeyCode.Delete;
        case 'Backquote':
            return KeyCode.BackQuote;
        case 'Digit1':
            return KeyCode.Digit1;
        case 'Digit2':
            return KeyCode.Digit2;
        case 'Digit3':
            return KeyCode.Digit3;
        case 'Digit4':
            return KeyCode.Digit4;
        case 'Digit5':
            return KeyCode.Digit5;
        case 'Digit6':
            return KeyCode.Digit6;
        case 'Digit7':
            return KeyCode.Digit7;
        case 'Digit8':
            return KeyCode.Digit8;
        case 'Digit9':
            return KeyCode.Digit9;
        case 'Digit0':
            return KeyCode.Digit0;
        case 'Minus':
            return KeyCode.Minus;
        case 'Equal':
            return KeyCode.Equal;
        case 'Backspace':
            return KeyCode.Backspace;
        case 'Tab':
            return KeyCode.Tab;
        case 'KeyA':
            return KeyCode.LetterA;
        case 'KeyB':
            return KeyCode.LetterB;
        case 'KeyC':
            return KeyCode.LetterC;
        case 'KeyD':
            return KeyCode.LetterD;
        case 'KeyE':
            return KeyCode.LetterE;
        case 'KeyF':
            return KeyCode.LetterF;
        case 'KeyG':
            return KeyCode.LetterG;
        case 'KeyH':
            return KeyCode.LetterH;
        case 'KeyI':
            return KeyCode.LetterI;
        case 'KeyJ':
            return KeyCode.LetterJ;
        case 'KeyK':
            return KeyCode.LetterK;
        case 'KeyL':
            return KeyCode.LetterL;
        case 'KeyM':
            return KeyCode.LetterM;
        case 'KeyN':
            return KeyCode.LetterN;
        case 'KeyO':
            return KeyCode.LetterO;
        case 'KeyP':
            return KeyCode.LetterP;
        case 'KeyQ':
            return KeyCode.LetterQ;
        case 'KeyR':
            return KeyCode.LetterR;
        case 'KeyS':
            return KeyCode.LetterS;
        case 'KeyT':
            return KeyCode.LetterT;
        case 'KeyU':
            return KeyCode.LetterU;
        case 'KeyV':
            return KeyCode.LetterV;
        case 'KeyW':
            return KeyCode.LetterW;
        case 'KeyX':
            return KeyCode.LetterX;
        case 'KeyY':
            return KeyCode.LetterY;
        case 'KeyZ':
            return KeyCode.LetterZ;
        case 'BracketLeft':
            return KeyCode.BracketLeft;
        case 'BracketRight':
            return KeyCode.BracketRight;
        case 'Backslash':
            return KeyCode.BackSlash;
        case 'CapsLock':
            return KeyCode.CapsLock;
        case 'Semicolon':
            return KeyCode.Semicolon;
        case 'Quote':
            return KeyCode.Quote;
        case 'Enter':
            return KeyCode.Enter;
        case 'ShiftLeft':
        case 'ShiftRight':
            return KeyCode.Shift;
        case 'Comma':
            return KeyCode.Comma;
        case 'Period':
            return KeyCode.Period;
        case 'Slash':
            return KeyCode.Slash;
        case 'ControlLeft':
        case 'ControlRight':
            return KeyCode.Control;
        case 'AltLeft':
        case 'AltRight':
            return KeyCode.Alt;
        case 'ArrowUp':
            return KeyCode.ArrowUp;
        case 'ArrowDown':
            return KeyCode.ArrowDown;
        case 'ArrowLeft':
            return KeyCode.ArrowLeft;
        case 'ArrowRight':
            return KeyCode.ArrowRight;
        case 'Numpad0':
            return KeyCode.Numpad0;
        case 'Numpad1':
            return KeyCode.Numpad1;
        case 'Numpad2':
            return KeyCode.Numpad2;
        case 'Numpad3':
            return KeyCode.Numpad3;
        case 'Numpad4':
            return KeyCode.Numpad4;
        case 'Numpad5':
            return KeyCode.Numpad5;
        case 'Numpad6':
            return KeyCode.Numpad6;
        case 'Numpad7':
            return KeyCode.Numpad7;
        case 'Numpad8':
            return KeyCode.Numpad8;
        case 'Numpad9':
            return KeyCode.Numpad9;
        case 'NumpadAdd':
            return KeyCode.NumpadAdd;
        case 'NumpadSubtract':
            return KeyCode.NumpadSubtract;
        case 'NumpadMultiply':
            return KeyCode.NumpadMultiply;
        case 'NumpadDivide':
            return KeyCode.NumpadDivide;
        case 'NumpadSeparator':
            return KeyCode.NumpadSeparator;
        case 'NumpadDecimal':
            return KeyCode.NumpadDecimal;
        case 'PageDown':
            return KeyCode.PageDown;
        case 'PageUp':
            return KeyCode.PageUp;
        default:
            throw Error(`Unsupported code: ${code}`);
    }
}

export function isModifier(key: KeyCode) {
    return key === 'ctrl' || key === 'alt' || key === 'shift';
}

export function isValidKeyCode(key: string) {
    return Object.values<string>(KeyCode).includes(key);
}
