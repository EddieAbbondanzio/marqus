import { createNote, Note } from "../../src/shared/domain/note";
import { writeFile } from "../../src/main/fileSystem";
import { loadMetadata, saveMetadata } from "../../src/main/rpcs/notes";

jest.mock("../../src/main/fileSystem", () => ({
  writeFile: jest.fn(),
  readFile: () => {
    return JSON.parse(
      JSON.stringify(
        createNote({
          dateUpdated: new Date(),
          name: "Foo",
        })
      )
    );
  },
  createDirectory: jest.fn(),
  exists: jest.fn(),
}));

test("saveMetadata", async () => {
  const note = createNote({
    name: "foo",
    dateUpdated: new Date(),
  });

  await saveMetadata(note);
  expect(writeFile as jest.Mock).toBeCalled();
  const serialized = (writeFile as jest.Mock).mock.calls[0][1];
  expect(serialized).toHaveProperty("id", note.id);
  expect(serialized).not.toHaveProperty("type");
  expect(serialized).toHaveProperty("dateCreated");
  expect(serialized).toHaveProperty("dateUpdated");
  expect(serialized).toHaveProperty("name", "foo");
});

test("loadMetadata", async () => {
  const meta = await loadMetadata("1");
  expect(meta.type).toBe("note");
  expect(meta.dateCreated).toBeInstanceOf(Date);
  expect(meta.dateUpdated).toBeInstanceOf(Date);
});
