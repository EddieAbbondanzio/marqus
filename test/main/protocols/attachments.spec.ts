import { protocol } from "electron";
import { registerAttachmentsProtocol } from "../../../src/main/protocols/attachments";
import { uuid } from "../../../src/shared/domain";
import { Protocol } from "../../../src/shared/domain/protocols";
import fs from "fs";
import path from "path";

jest.mock("path");
jest.mock("fs");

test("registerAttachmentsProtocol", async () => {
  const registerFileProtocol = jest.fn();
  protocol.registerFileProtocol = registerFileProtocol;
  registerAttachmentsProtocol("fake-note-dir");

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

  (path.resolve as jest.Mock)
    .mockReset()
    .mockReturnValueOnce("full/path/to/foo.jpg");
  (fs.existsSync as jest.Mock).mockReturnValueOnce(true);

  const cb = jest.fn();
  callback({ url: `attachments://foo.jpg?noteId=${uuid()}` }, cb);
  expect(path.resolve).toHaveBeenCalled();
  expect(cb).toHaveBeenCalledWith("full/path/to/foo.jpg");
});
