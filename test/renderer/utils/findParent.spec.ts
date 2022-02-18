import { findParent } from "../../../src/renderer/utils/findParent";

describe("climbDomUntil()", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  test("it checks for stop condition before doing anything", () => {
    const r = findParent(child, () => true, { stop: () => true });
    expect(r).toBeFalsy();
  });

  test("returns true when match on initial element", () => {
    const r = findParent(child, (el) => el === child);
    expect(r).toBeTruthy();
  });

  test("returns true when match on parent", () => {
    const r = findParent(child, (el) => el === parent);
    expect(r).toBeTruthy();
  });

  test("returns match value on match and passed", () => {
    const r = findParent(child, (el) => el === parent, {
      matchValue: () => 3,
    });

    expect(r).toBe(3);
  });

  test("returns false when no match, and no default value", () => {
    const r = findParent(child, () => false);

    expect(r).toBeFalsy();
  });

  test("returns default value on stop condition if passed", () => {
    const r = findParent(child, () => true, {
      stop: () => true,
      matchValue: 42,
      defaultValue: 3,
    });

    expect(r).toBe(3);
  });

  test("returns default value on failed if passed", () => {
    const r = findParent(child, () => false, {
      matchValue: () => 42,
      defaultValue: () => 3,
    });

    expect(r).toBe(3);
  });
});
