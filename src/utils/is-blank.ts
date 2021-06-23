/**
 * Checks if the is null, undefined, or empty
 * @param str String to check.
 */
export function isBlank(str: string) {
    return !str || /^\s*$/.test(str);
}
