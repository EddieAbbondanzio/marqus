export type MouseButton = 'left' | 'right' | 'either';

export function getButton(index: number): MouseButton {
    if (index === 0) {
        return 'left';
    } else if (index === 2) {
        return 'right';
    } else {
        return 'either';
    }
}
