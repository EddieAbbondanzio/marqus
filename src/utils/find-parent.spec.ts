import { findParent } from "./find-parent";

describe("climbDomUntil()", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  it("it checks for stop condition before doing anything", () => {
    const r = findParent(child, () => true, { stop: () => true });
    expect(r).toBeFalsy();
  });

  it("returns true when match on initial element", () => {
    const r = findParent(child, el => el === child);
    expect(r).toBeTruthy();
  });

  it("returns true when match on parent", () => {
    const r = findParent(child, el => el === parent);
    expect(r).toBeTruthy();
  });

  it("returns match value on match and passed", () => {
    const r = findParent(child, el => el === parent, {
      matchValue: () => 3
    });

    expect(r).toBe(3);
  });

  it("returns false when no match, and no default value", () => {
    const r = findParent(child, () => false);

    expect(r).toBeFalsy();
  });

  it("returns default value on stop condition if passed", () => {
    const r = findParent(child, () => true, {
      stop: () => true,
      matchValue: 42,
      defaultValue: 3
    });

    expect(r).toBe(3);
  });

  it("returns default value on failed if passed", () => {
    const r = findParent(child, () => false, {
      matchValue: () => 42,
      defaultValue: () => 3
    });

    expect(r).toBe(3);
  });
});
