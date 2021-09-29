type Match = (el: HTMLElement) => boolean;
type Stop = (el: HTMLElement) => boolean;
type MatchValue<T> = ((el: HTMLElement) => T) | T;
type DefaultValue<T> = (() => T) | T;

type OptsForBoolean = {
  stop?: Stop;
};

type OptsForValueOrNull<T> = OptsForBoolean & {
  matchValue: MatchValue<T>;
};

type OptsForValueOrDefault<T> = OptsForValueOrNull<T> & {
  defaultValue: DefaultValue<T>;
};

/**
 * Climb the dom until we hit a match based on the passed predicate.
 * @param start Element to start at.
 * @param match Predicate that determines when we found a match.
 * @param opts Values to return based on if we hit a match, or missed and got the default back.
 * @returns matchValue if we got a hit, otherwise defaultValue or null.
 */
export function climbDomForMatch<T>(
  start: HTMLElement,
  match: Match,
  opts: OptsForValueOrDefault<T>
): T;
/**
 * Climb the dom until we hit a match based on the passed predicate.
 * @param start Element to start at.
 * @param match Predicate that determines when we found a match.
 * @param opts Values to return based on if we hit a match, or missed and got null as the default.
 * @returns matchValue if we got a hit, otherwise null.
 */
export function climbDomForMatch<T>(
  start: HTMLElement,
  match: Match,
  opts: OptsForValueOrNull<T>
): T | null;
/**
 * Climb the dom until we hit a match based on the passed predicate.
 * @param start Element to start at.
 * @param match Predicate that determins when we found a match.
 * @param opts When to stop.
 * @returns True if we found a match
 */
export function climbDomForMatch(
  start: HTMLElement,
  match: Match,
  opts?: OptsForBoolean
): boolean;
export function climbDomForMatch(
  start: HTMLElement,
  match: Match,
  opts?: any
): any {
  const found = climbRecursiveStep(start, match, opts?.stop);

  if (found.el != null && !found.hitStop) {
    // No options passed means we just need to return true if we got a hit.
    if (opts == null) {
      return true;
    }

    return opts.matchValue != null
      ? typeof opts.matchValue === "function"
        ? opts.matchValue(found.el)
        : opts.matchValue
      : null;
  } else {
    if (opts == null) {
      return false;
    }

    return opts.defaultValue != null
      ? typeof opts.defaultValue === "function"
        ? opts.defaultValue()
        : opts.defaultValue
      : null;
  }
}

type RecursiveStepResult = { el?: HTMLElement; hitStop: boolean };

function climbRecursiveStep(
  el: HTMLElement,
  match: Match,
  stop?: Stop
): RecursiveStepResult {
  // Handle stop early
  if (stop != null && stop(el)) {
    return { el, hitStop: true };
  }

  // Check if we hit a match
  if (match(el)) {
    return { el, hitStop: false };
  }

  // Visit parent
  if (el.parentElement != null) {
    return climbRecursiveStep(el.parentElement, match, stop);
  }

  // Failed
  return { hitStop: false };
}
