import {
  addChild,
  createNotebook,
  getNotebookById,
  getNotebookSchema,
  removeChild,
} from "./notebook";

test("getNotebookSchema detects duplicate name and same parent", () => {
  const notebook1 = createNotebook({ name: "foo" });
  const notebook2 = createNotebook({ name: "foo" });
  const schema = getNotebookSchema([notebook1]);
  expect(() => {
    schema.validateSync(notebook2);
  }).toThrow();
});

test("getNotebook schema recursively works on children", () => {
  const parent = createNotebook({ name: "foo" });
  const child = createNotebook({ name: "foo" });
  child.name = null!;
  addChild(parent, child);

  const schema = getNotebookSchema([parent]);
  expect(() => {
    schema.validateSync(parent);
  }).toThrow();
});

describe("getNotebookById()", () => {
  const notebooks = [createNotebook({ name: "horse" })];
  const child1 = createNotebook({ name: "correct" });
  const child2 = createNotebook({ name: "battery" });
  const child3 = createNotebook({ name: "staple" });

  addChild(notebooks[0], child1);
  addChild(notebooks[0], child2);
  addChild(notebooks[0], child3);

  test("throws if no notebooks passed", () => {
    expect(() => {
      const match = getNotebookById(null!, "1");
    }).toThrow();
  });

  test("can find a root match", () => {
    const match = getNotebookById(notebooks, notebooks[0].id);
    expect(match).toHaveProperty("id", notebooks[0].id);
  });

  test("can find a nested notebook", () => {
    const match = getNotebookById(notebooks, notebooks[0].children![2].id);
    expect(match).toHaveProperty("id", notebooks[0].children![2].id);
  });

  test("returns nothing if no match found after searching", () => {
    expect(() => {
      const match = getNotebookById(notebooks, "1");
    }).toThrow();
  });
});

test("addChild", () => {
  const parent = createNotebook({ name: "parent" });
  const child = createNotebook({ name: "child" });
  addChild(parent, child);
  expect(parent.children).toHaveLength(1);
  expect(child.parent).toBe(parent);
});

test("removeChild", () => {
  const parent = createNotebook({ name: "parent" });
  const child1 = createNotebook({ name: "child1" });
  const child2 = createNotebook({ name: "child2" });
  addChild(parent, child1);
  addChild(parent, child2);

  removeChild(parent, child1);
  expect(parent.children).toEqual([child2]);
  expect(child1.parent).toBe(undefined);
});
