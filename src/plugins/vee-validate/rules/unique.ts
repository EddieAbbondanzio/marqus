import { store } from '@/store';

export function unique(
    value: string | null,
    [values, identifier, uniqueValue, entity]: [() => any[], (v: any) => any, (v: any) => any, () => any]
): boolean {
    if (value == null) {
        return true;
    }

    const match = values().find((v) => value === uniqueValue(v));
    const orig = entity();

    if (match != null && identifier(orig) !== identifier(match)) {
        return false;
    }

    return true;
}
