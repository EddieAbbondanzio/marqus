import { uuid } from "../../shared/domain/id";
import { Note } from "../../shared/domain/note";
import { readFile, writeFile } from "../fileSystem";
import { loadMetadata, saveMetadata } from "./notes";

jest.mock("../fileSystem", () => ({
  writeFile: jest.fn(),
  readFile: (path: string) => {
    return JSON.parse(
      JSON.stringify({
        id: uuid(),
        dateCreated: new Date(),
        dateUpdated: new Date(),
        name: "Foo",
      })
    );
  },
}));

test("saveMetadata", async () => {
  const note: Note = {
    id: uuid(),
    type: "note",
    dateCreated: new Date(),
    dateUpdated: new Date(),
    name: "Foo",
  };

  await saveMetadata(note);
  expect(writeFile as jest.Mock).toBeCalled();
  expect((writeFile as jest.Mock).mock.calls[0][1]).not.toHaveProperty("type");
});

test("loadMetadata", async () => {
  const meta = await loadMetadata("1");
  expect(meta.type).toBe("note");
  expect(meta.dateCreated).toBeInstanceOf(Date);
  expect(meta.dateUpdated).toBeInstanceOf(Date);
});
