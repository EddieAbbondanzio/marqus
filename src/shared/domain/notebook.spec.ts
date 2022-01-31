import { uuid } from "./id";
import { getNotebookById, Notebook } from "./notebook";

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
