export function unique(
    value: string | null,
    [values, identifier, uniqueValue]: [() => any[], (v: any) => any, (v: any) => any]
): boolean {
    if (value == null) {
        return true;
    }

    const match = values().find((v) => value === uniqueValue(v));
    if (match != null && identifier(value) !== identifier(match)) {
        return false;
    }

    return true;
}
