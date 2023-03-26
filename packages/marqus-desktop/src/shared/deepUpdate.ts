/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-types */
import { cloneDeep, get } from "lodash";
import { DeepPartial } from "tsdef";
import { isBlank } from "./utils";

/**
 * Recursive partial updater that applies property updates.
 * @param obj The object to apply updates to
 * @param updates Partial updates to apply. Can delete props by passing = undefined.
 * @returns The newly updated object.
 */
export function deepUpdate<T extends {}>(
  obj: T,
  updates: DeepPartial<T>,
  ignoredPaths?: RegExp[],
): T {
  breadthFirst(
    updates,
    (update, property, path) => {
      const existing = get(obj, path);
      /**
       * To prevent from updating children properties from their parents we don't
       * perform updates on objects unless their value has been deleted.
       */
      if (
        typeof existing === "object" &&
        !Array.isArray(existing) &&
        update[property] != null
      ) {
        return;
      }

      if (update.hasOwnProperty(property)) {
        const newValue = update[property];
        const parentPath = path.split(".").slice(0, -1).join(".");
        let parent = isBlank(parentPath) ? obj : get(obj, parentPath);

        // Delete
        if (newValue == null) {
          delete parent[property];
        }
        // Update
        else {
          parent[property] = newValue;
        }
      }
    },
    ignoredPaths,
  );

  return obj;
}

/**
 * Iterate an object in breadth first order. This will visit all siblings before
 * moving to a deeper nested object.
 * @param root The object to start with.
 * @param step Step iterator
 * @param path Full path in dot notation "parent.child.grandChild"
 */
function breadthFirst(
  root: Record<string, any>,
  step: (target: any, property: string, path: string) => void,
  ignorePaths?: RegExp[],
): void {
  // N.B. Objects we iterate may have circular references from a child to parent.
  // To get around this, we check if we've already visited an object once and if
  // so, skip it.
  const visited: Map<object, boolean> = new Map();

  const recursiveStep = (
    target: Record<string, any>,
    step: (target: any, property: string, path: string) => void,
    path?: string,
  ) => {
    const toVisit: [any, string][] = [];

    visited.set(target, true);

    // Iterate root properties
    for (const k in target) {
      const child = target[k];

      let p = path == null ? k : `${path}.${k}`;

      if (ignorePaths != null && ignorePaths.some(ip => ip.test(p))) {
        continue;
      }

      // We don't visit children in an array
      if (typeof child === "object" && !Array.isArray(child)) {
        toVisit.push([child, k]);
      }

      step(target, k, p);
    }

    // Visit any children we found
    for (const [next, prop] of toVisit) {
      if (visited.has(next)) {
        return;
      }

      let fullPath = path == null ? prop : `${path}.${prop}`;
      recursiveStep(next, step, fullPath);
    }
  };
  recursiveStep(root, step);
}
