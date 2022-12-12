import { protocol } from "electron";
import {
  parseAttachmentPath,
  registerAttachmentsProtocol,
} from "../../../src/main/protocols/attachments";
import { uuid } from "../../../src/shared/domain";
import { Protocol } from "../../../src/shared/domain/protocols";
import mockFS from "mock-fs";
import { ATTACHMENTS_DIRECTORY } from "../../../src/main/ipc/plugins/notes";

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
    Protocol.Attachment,
    expect.anything(),
  );

  const callback = registerFileProtocol.mock.calls[0][1];
  expect(typeof callback).toBe("function");

  // Random string
  expect(() => callback({ url: "not-attachment-url" }, jest.fn())).toThrow(
    /URL .* is not a valid attachments url/,
  );

  //Missing prefix
  expect(() => callback({ url: "foo.jpg?noteId=123" }, jest.fn())).toThrow(
    /URL .* is not a valid attachments url/,
  );

  // Missing noteId param
  expect(() => callback({ url: "attachment://foo.jpg" }, jest.fn())).toThrow(
    /Invalid note id \(.*\) in attachment path/,
  );

  const cb = jest.fn();

  // Valid file.
  callback({ url: `attachment://foo.jpg?noteId=${noteId}` }, cb);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith(
    expect.stringContaining(
      `${FAKE_NOTE_DIRECTORY}/${noteId}/${ATTACHMENTS_DIRECTORY}/foo.jpg`,
    ),
  );

  cb.mockReset();

  // File not found.
  callback({ url: `attachment://bar.jpg?noteId=${noteId}` }, cb);
  expect(cb).toHaveBeenCalledTimes(1);
  expect(cb).toHaveBeenCalledWith({ statusCode: 404 });
});

test("parseAttachmentPath", () => {
  const noteId = uuid();

  // Normal file.
  expect(
    parseAttachmentPath("notes", `attachment://foo.jpg?noteId=${noteId}`),
  ).toMatch(`notes/${noteId}/${ATTACHMENTS_DIRECTORY}/foo.jpg`);

  // Nested file
  expect(
    parseAttachmentPath(
      "notes",
      `attachment://longer/path/to/bar.jpg?noteId=${noteId}`,
    ),
  ).toMatch(`notes/${noteId}/${ATTACHMENTS_DIRECTORY}/longer/path/to/bar.jpg`);

  // Decodes URL encoded spaces
  expect(
    parseAttachmentPath(
      "notes",
      `attachment://longer/path/to/foo%20bar.jpg?noteId=${noteId}`,
    ),
  ).toMatch(
    `notes/${noteId}/${ATTACHMENTS_DIRECTORY}/longer/path/to/foo bar.jpg`,
  );

  // Throw if file was outside of the folder.
  expect(() =>
    parseAttachmentPath("notes", `attachment://../../foo.jpg?noteId=${noteId}`),
  ).toThrow(/is outside of attachment directory/);
});
