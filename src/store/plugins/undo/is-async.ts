const AsyncFunction = (async () => {}).constructor;

/**
 * Check if a function is asyncrhonous.
 * @param fn The function to check.
 * @returns True if it's an async function
 */
function isAsync(fn: () => any): boolean {
    return fn instanceof AsyncFunction;
}
