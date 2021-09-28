import { fileSystem } from "@/utils/file-system";
import path from "path";
import {
  loadNoteContent,
  NOTE_CONTENT_FILE_NAME,
  NOTE_DIRECTORY,
  saveNoteContent
} from ".";

describe("loadNoteContent()", () => {
  it("properly defines path", () => {
    const mock = jest.fn();
    fileSystem.readText = mock;

    const noteId = "1";
    loadNoteContent(noteId);
    expect(mock).toHaveBeenCalledWith(
      path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME),
      { root: true }
    );
  });
});

describe("saveNoteContent()", () => {
  it("properly defines path", () => {
    const mock = jest.fn();
    fileSystem.writeText = mock;

    const noteId = "1";
    const noteContent = "content";
    saveNoteContent(noteId, noteContent);
    expect(mock).toHaveBeenCalledWith(
      path.join(NOTE_DIRECTORY, noteId, NOTE_CONTENT_FILE_NAME),
      noteContent
    );
  });
});
