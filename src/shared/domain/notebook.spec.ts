import { uuid } from "./id";
import {
  addChild,
  getNotebookById,
  getNotebookSchema,
  Notebook,
  removeChild,
} from "./notebook";

test("getNotebookSchema detects duplicate name and same parent", () => {
  const notebook1: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "foo",
    dateCreated: new Date(),
  };
  const notebook2: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "foo",
    dateCreated: new Date(),
  };

  const schema = getNotebookSchema([notebook1]);
  expect(() => {
    schema.validateSync(notebook2);
  }).toThrow();
});

test("getNotebook schema recursively works on children", () => {
  const parent: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "bar",
    dateCreated: new Date(),
  };
  const notebook2: Notebook = {
    id: uuid(),
    type: "notebook",
  } as Notebook;
  addChild(parent, notebook2);

  const schema = getNotebookSchema([parent]);
  expect(() => {
    schema.validateSync(parent);
  }).toThrow();
});

describe("getNotebookById()", () => {
  const notebooks: Notebook[] = [
    {
      id: uuid(),
      name: "horse",
      children: [
        { id: uuid(), name: "correct" } as Notebook,
        { id: uuid(), name: "battery" } as Notebook,
        { id: uuid(), name: "staple" } as Notebook,
      ],
    } as Notebook,
  ];

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
  const parent: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "Parent",
    dateCreated: new Date(),
  };
  const child: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "Child",
    dateCreated: new Date(),
  };
  addChild(parent, child);
  expect(parent.children).toHaveLength(1);
  expect(child.parent).toBe(parent);
});

test("removeChild", () => {
  const parent: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "Parent",
    dateCreated: new Date(),
  };
  const child1: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "Child",
    dateCreated: new Date(),
  };
  const child2: Notebook = {
    id: uuid(),
    type: "notebook",
    name: "Child",
    dateCreated: new Date(),
  };
  addChild(parent, child1);
  addChild(parent, child2);

  removeChild(parent, child1);
  expect(parent.children).toEqual([child2]);
  expect(child1.parent).toBe(undefined);
});
