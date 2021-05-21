export function ensure<T>(argument: T | undefined | null, message = 'Value was required.'): T {
    if (argument === undefined || argument === null) {
        throw new TypeError(message);
    }

    return argument;
}
