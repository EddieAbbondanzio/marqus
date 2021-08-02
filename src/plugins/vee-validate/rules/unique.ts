import { store } from '@/store';

export function unique(
    value: string | null,
    [getValues, identifier, uniqueValue, valueEntity]: [() => any[], (v: any) => any, (v: any) => any, any | undefined]
): boolean {
    if (value == null) {
        return true;
    }

    const isUpdate = valueEntity != null;
    // Create
    if (!isUpdate) {
        return getValues().every((v) => value !== uniqueValue(v));
    }
    // Update
    else {
        const match = getValues().find((v) => uniqueValue(v) === value);

        if (match == null) {
            return true;
        }

        return identifier(valueEntity) !== identifier(match);
    }
}
