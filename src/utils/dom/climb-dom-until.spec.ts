import { climbDomUntil } from "@/utils/dom/climb-dom-hierarchy";

describe("climbDomUntil()", () => {
  let parent = document.createElement("div");
  let child = document.createElement("div");
  parent.append(child);

  it("it checks for stop condition before doing anything", () => {
    const r = climbDomUntil<boolean>(child, {
      match: el => true,
      stop: el => true
    });

    expect(r).toBeFalsy();
  });

  it("returns true when match on initial element", () => {
    const r = climbDomUntil<boolean>(child, {
      match: el => el == child
    });

    expect(r).toBeTruthy();
  });

  it("returns true when match on parent", () => {
    const r = climbDomUntil<boolean>(child, {
      match: el => el == parent
    });

    expect(r).toBeTruthy();
  });

  it("returns match value on match and passed", () => {
    const r = climbDomUntil(child, {
      match: el => el == parent,
      matchValue: () => 3
    });

    expect(r).toBe(3);
  });

  it("returns false when no match, and no default value", () => {
    const r = climbDomUntil<boolean>(child, {
      match: el => false
    });

    expect(r).toBeFalsy();
  });

  it("returns default value on stop condition if passed", () => {
    const r = climbDomUntil(child, {
      stop: () => true,
      match: el => true,
      matchValue: () => 42,
      defaultValue: () => 3
    });

    expect(r).toBe(3);
  });

  it("returns default value on failed if passed", () => {
    const r = climbDomUntil(child, {
      match: el => false,
      matchValue: () => 42,
      defaultValue: () => 3
    });

    expect(r).toBe(3);
  });
});
