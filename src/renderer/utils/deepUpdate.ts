import { cloneDeep, get, propertyOf, remove, set } from "lodash";
import { DeepPartial } from "tsdef";
import { isBlank } from "../../shared/string";

/**
 * Recursive partial updater that applies property updates.
 * @param obj The object to apply updates to
 * @param updates Partial updates to apply. Can delete props by passing = undefined.
 * @returns The newly updated object.
 */
export function deepUpdate<T extends {}>(obj: T, updates: DeepPartial<T>): T {
  const newObj = cloneDeep(obj);

  breadthFirst(updates, (update, property, path) => {
    const existing = get(newObj, path);
    if (typeof existing === "object") {
      return;
    }

    if (update.hasOwnProperty(property)) {
      const newValue = update[property];

      // Delete
      if (newValue == null) {
        const parentPath = path.split(".").slice(0, -1).join(".");
        let parent = isBlank(parentPath) ? newObj : get(newObj, parentPath);

        delete parent[property];
      }
      // Update
      else {
        set(newObj, path, newValue);
      }
    }
  });

  return newObj;
}

/**
 * Iterate an object in breadth first order. This will visit all siblings before
 * moving to a deeper nested object.
 * @param target The object to start with.
 * @param step Step iterator
 * @param path Full path in dot notation "parent.child.grandChild"
 */
function breadthFirst(
  target: Record<string, any>,
  step: (target: any, property: string, path: string) => void,
  path?: string
): void {
  const toVisit: [any, string][] = [];

  // Iterate root properties
  for (const k in target) {
    if (typeof target[k] === "object") {
      toVisit.push([target[k], k]);
    }

    let p = path == null ? k : `${path}.${k}`;
    step(target, k, p);
  }

  // Visit any children we found
  for (const [next, prop] of toVisit) {
    let fullPath = path == null ? prop : `${path}.${prop}`;
    breadthFirst(next, step, fullPath);
  }
}
