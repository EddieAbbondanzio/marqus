import { protocol } from "electron";
import {
  parseAttachmentPath,
  registerAttachmentsProtocol,
} from "../../../src/main/protocols/attachments";
import { uuid } from "../../../src/shared/domain";
import { Protocol } from "../../../src/shared/domain/protocols";
import mockFS from "mock-fs";
import { ATTACHMENTS_DIRECTORY } from "../../../src/main/ipcs/notes";

afterEach(() => {
  mockFS.restore();
});

test("registerAttachmentsProtocol", async () => {
  const noteId = uuid();
  const FAKE_NOTE_DIRECTORY = "fake-note-dir";
  mockFS({
    [FAKE_NOTE_DIRECTORY]: {
      [noteId]: {
        [ATTACHMENTS_DIRECTORY]: {
          "foo.jpg": "image-data",
        },
      },
    },
  });

  const registerFileProtocol = jest.fn();
  protocol.registerFileProtocol = registerFileProtocol;
  registerAttachmentsProtocol(FAKE_NOTE_DIRECTORY);

  expect(registerFileProtocol).toHaveBeenCalledWith(
    Protocol.Attachments,
    expect.anything(),
  );

  const callback = registerFileProtocol.mock.calls[0][1];
  expect(typeof callback).toBe("function");

  expect(() => callback({ url: "not-attachment-url" }, jest.fn())).toThrow(
    /URL .* doesn't match/,
  );
  expect(() => callback({ url: "foo.jpg?noteId=123" }, jest.fn())).toThrow(
    /URL .* doesn't match/,
  );
  expect(() => callback({ url: "attachments://foo.jpg" }, jest.fn())).toThrow(
    /URL .* doesn't match/,
  );

  const cb = jest.fn();

  // Valid file.
  callback({ url: `attachments://foo.jpg?noteId=${noteId}` }, cb);
  expect(cb).toHaveBeenCalledWith(
    expect.stringContaining(
      `${FAKE_NOTE_DIRECTORY}/${noteId}/${ATTACHMENTS_DIRECTORY}/foo.jpg`,
    ),
  );

  // File not found.
  callback({ url: `attachments://bar.jpg?noteId=${noteId}` }, cb);
  expect(cb).toHaveBeenCalledWith({ statusCode: 404 });
});

test("parseAttachmentPath", () => {
  const noteId = uuid();

  // Normal file.
  expect(
    parseAttachmentPath("notes", `attachments://foo.jpg?noteId=${noteId}`),
  ).toMatch(`notes/${noteId}/${ATTACHMENTS_DIRECTORY}/foo.jpg`);

  // Nested file
  expect(
    parseAttachmentPath(
      "notes",
      `attachments://longer/path/to/bar.jpg?noteId=${noteId}`,
    ),
  ).toMatch(`notes/${noteId}/${ATTACHMENTS_DIRECTORY}/longer/path/to/bar.jpg`);

  // Throw if file was outside of the folder.
  expect(() =>
    parseAttachmentPath(
      "notes",
      `attachments://../../foo.jpg?noteId=${noteId}`,
    ),
  ).toThrow(/is outside of attachment directory/);
});
