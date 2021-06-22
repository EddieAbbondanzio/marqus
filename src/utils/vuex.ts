/**
 * Split a namespaced mutation apart.
 * @param m The fully qualified mutation to split.
 * @returns A tuple containing the namespace as the first element, and the mutation as the second.
 */
export function splitMutationAndNamespace(m: string): [string, string] {
    const lastSlash = m.lastIndexOf('/');

    // Root mutation case.
    if (lastSlash == -1) {
        return ['', m];
    }

    // We add 1 to lastSlash index on mutation name to leave out the /
    return [m.slice(0, lastSlash), m.slice(lastSlash + 1)];
}
