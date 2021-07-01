const AsyncFunction = (async () => {}).constructor;

/**
 * Check if a function is asynchronous.
 * @param fn The function to check.
 * @returns True if it's an async function
 */
export function isAsync(fn: (...args: any[]) => any): boolean {
    return fn instanceof AsyncFunction;
}
