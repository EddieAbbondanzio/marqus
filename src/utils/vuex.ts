import { Store } from "vuex";

/**
 * Split a namespaced mutation apart.
 * @param m The fully qualified mutation to split.
 * @returns A tuple containing the namespace as the first element, and the mutation as the second.
 */
export function splitMutationAndNamespace(m: string): [string, string] {
  const lastSlash = m.lastIndexOf("/");

  // Root mutation case.
  if (lastSlash === -1) {
    return ["", m];
  }

  // We add 1 to lastSlash index on mutation name to leave out the /
  return [m.slice(0, lastSlash), m.slice(lastSlash + 1)];
}

/**
 * Retrieve the state of a namespaced module from the store. Supports infinitely nested
 * modules and gives us an easy way to access them via paths.
 * @param store The vuex store.
 * @param namespace The full namespace (no mutation name) ex: foo/bar/baz
 * @returns The state of the namespaced module.
 */
export function getNamespacedState(store: Store<any>, namespace: string) {
  const splitApart = namespace.split("/");
  return getNamespacedStateRecursiveStep(splitApart, store.state);
}

function getNamespacedStateRecursiveStep(
  splitArray: string[],
  currentModule: any
): any {
  if (splitArray.length === 0) {
    return currentModule;
  }

  // Get the next namespace to traverse to, and call the function again at our new position.
  const currStep = splitArray.shift()!;
  return getNamespacedStateRecursiveStep(splitArray, currentModule[currStep]);
}
