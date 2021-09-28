// Needed for arrow returns
type Nullable<T> = T | null;

/**
 * Conditional type of either a boolean, or nullable T.
 */
export type ClimbReturn<T> = T extends boolean ? boolean : T | null;

/**
 * Climb options to allow for additional behaviors.
 */
export type ConstrainedClimbOptions<T> = T extends boolean
    ? {
          /**
           * Match predicate to check each element against. Should return
           * true when it's time to stop.
           */
          match: (el: HTMLElement) => boolean;
          /**
           * Stop conditional used to determine if we should quit early.
           */
          stop?: (el: HTMLElement) => boolean;
      }
    : {
          /**
           * Match predicate to check each element against. Should return
           * true when it's time to stop.
           */
          match: (el: HTMLElement) => boolean;
          /**
           * Stop conditional used to determine if we should quit early.
           */
          stop?: (el: HTMLElement) => boolean;
          /**
           * Return value when a match is found.
           */
          matchValue: (el: HTMLElement) => Nullable<T>;
          /**
           * Return value when no match is found, or we stopped.
           */
          defaultValue?: () => Nullable<T>;
      };

type ClimbOptions<T> = {
    match: (el: HTMLElement) => boolean;
    stop?: (el: HTMLElement) => boolean;
    matchValue?: (el: HTMLElement) => Nullable<T>;
    defaultValue?: () => Nullable<T>;
};

/**
 * Recursively climb the DOM hierarchy until a specific condition is met.
 * @param el The element to start at
 * @param opts Extra options
 */
export function climbDomHierarchy<T>(el: HTMLElement, opts: ConstrainedClimbOptions<T>): ClimbReturn<T>;
export function climbDomHierarchy<T>(el: HTMLElement, opts: ClimbOptions<T>): ClimbReturn<T> {
    return climb(el, opts);
}

function climb<T>(el: HTMLElement, opts: ClimbOptions<T>): ClimbReturn<T> {
    // Test for a stop condition
    if (opts.stop != null && opts.stop(el)) {
        return opts.defaultValue == null ? false : (opts.defaultValue() as any);
    }
    // See if we found a match
    else if (opts.match(el)) {
        return opts.matchValue == null ? true : (opts.matchValue(el) as any);
    }
    // If there's a parent. Go visit it.
    else if (el.parentElement != null) {
        return climb(el.parentElement, opts);
    }
    // If we got to here, we failed..
    else {
        return opts.defaultValue == null ? (opts.matchValue == null ? false : null) : (opts.defaultValue() as any);
    }
}
