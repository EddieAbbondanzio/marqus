export function caseInsensitiveSorter(): (a: string, b: string) => number;
export function caseInsensitiveSorter<T>(mapper: (v: T) => string): (a: T, b: T) => number;
export function caseInsensitiveSorter<T>(mapper?: (v: T) => string) {
    if (mapper != null) {
        return (a: T, b: T) =>
            mapper(a)
                .toLowerCase()
                .localeCompare(mapper(b).toLowerCase());
    } else {
        return (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
    }
}
