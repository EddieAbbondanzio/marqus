import { searchNotes } from "../../../src/renderer/components/SidebarSearch";
import { uuid } from "../../../src/shared/domain";
import { createNote } from "../../../src/shared/domain/note";

test("searchNotes roots", () => {
  const notes = [
    createNote({
      name: "foo",
      content: "Random string lol",
    }),
    createNote({
      name: "bar",
      content: "Some more totally random text",
    }),
    createNote({
      name: "baz",
      content: "qqqqqqqqqqq",
    }),
  ];

  // Search by name
  const matches1 = searchNotes(notes, "f");
  expect(matches1).toHaveLength(1);
  expect(matches1[0].name).toBe("foo");

  // Search by content
  const matches2 = searchNotes(notes, "qqqq");
  expect(matches2).toHaveLength(1);
  expect(matches2[0].name).toBe("baz");
});

test("searchNotes nested", () => {
  const parentId = uuid();
  const nestedId = uuid();
  const doubleNestedId = uuid();

  const notes = [
    createNote({
      id: parentId,
      name: "parentq",
      content: "Random string lol",
      children: [
        createNote({
          id: nestedId,
          name: "nested",
          content: "Some more totally random text",
        }),
        createNote({
          name: "blarg",
          content: "",
          children: [
            createNote({
              id: doubleNestedId,
              name: "qqq",
            }),
          ],
        }),
      ],
    }),
  ];

  // Match just the parent
  const matches1 = searchNotes(notes, "parent");
  expect(matches1).toHaveLength(1);
  expect(matches1[0]).toMatchObject({
    id: parentId,
    children: [],
  });

  // Match the parent and nested
  const matches2 = searchNotes(notes, "e");
  expect(matches2).toHaveLength(1);
  expect(matches2).toEqual([
    expect.objectContaining({
      id: parentId,
      children: [
        expect.objectContaining({
          id: nestedId,
        }),
      ],
    }),
  ]);

  // Match just the nested note
  const matches3 = searchNotes(notes, "nested");
  expect(matches3).toHaveLength(1);
  expect(matches3[0]).toMatchObject({
    id: nestedId,
  });

  //Match just the double nested note
  const matches4 = searchNotes(notes, "qqq");
  expect(matches4).toHaveLength(1);
  expect(matches4[0]).toMatchObject({
    id: doubleNestedId,
  });
});
