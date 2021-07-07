import { Store } from 'vuex';

/**
 * Retrieve the state of a namespaced module from the store. Supports infinitely nested
 * modules and gives us an easy way to access them via paths.
 * @param store The vuex store.
 * @param namespace The full namespace (no mutation name) ex: foo/bar/baz
 * @returns The state of the namespaced module.
 */
export function getNamespacedState(store: Store<any>, namespace: string) {
    const splitApart = namespace.split('/');
    return getNamespacedStateRecursiveStep(splitApart, store.state);
}

function getNamespacedStateRecursiveStep(splitArray: string[], currentModule: any): any {
    if (splitArray.length === 0) {
        return currentModule;
    }

    // Get the next namespace to traverse to, and call the function again at our new position.
    const currStep = splitArray.shift()!;
    return getNamespacedStateRecursiveStep(splitArray, currentModule[currStep]);
}
