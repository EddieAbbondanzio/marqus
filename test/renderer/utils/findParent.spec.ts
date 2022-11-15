import { findParent } from "../../../src/renderer/utils/findParent";

test("findParent it checks for stop condition before doing anything", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, () => true, { stop: () => true });
  expect(r).toBeFalsy();
});

test("findParent returns true when match on initial element", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, el => el === child);
  expect(r).toBeTruthy();
});

test("findParent returns true when match on parent", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, el => el === parent);
  expect(r).toBeTruthy();
});

test("findParent returns match value on match and passed", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, el => el === parent, { 
    matchValue: () => 3,
  });

  expect(r).toBe(3);
});

test("findParent returns false when no match, and no default value", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, () => false);

  expect(r).toBeFalsy();
});

test("findParent returns default value on stop condition if passed", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, () => true, {
    stop: () => true,
    matchValue: 42,
    defaultValue: 3,
  });

  expect(r).toBe(3);
});

test("findParent returns default value on failed if passed", () => {
  const parent = document.createElement("div");
  const child = document.createElement("div");
  parent.append(child);

  const r = findParent(child, () => false, {
    matchValue: () => 42,
    defaultValue: () => 3,
  });

  expect(r).toBe(3);
});
