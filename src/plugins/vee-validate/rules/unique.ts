import { store } from '@/store';

export function unique(
    value: string | null,
    [getValues, identifier, uniqueValue, entity]: [() => any[], (v: any) => any, (v: any) => any, () => any]
): boolean {
    if (value == null) {
        return true;
    }

    const match = getValues().find((v) => value === uniqueValue(v));
    const orig = entity();

    // Easy case
    if (match == null) {
        return true;
    }

    // Hard case we might be updating
    if (identifier(orig ?? { id: '' }) !== identifier(match)) {
        return false;
    }

    return true;
}
