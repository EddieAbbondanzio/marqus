import { uuid } from "../../../src/shared/domain";
import {
  ATTACHMENTS_PROTOCOL_REGEX,
  buildAttachmentUrl,
  Protocol,
} from "../../../src/shared/domain/protocols";

test("ATTACHMENTS_PROTOCOL_REGEX", () => {
  expect(`attachments://foo?noteId=${uuid()}`).toMatch(
    ATTACHMENTS_PROTOCOL_REGEX,
  );

  expect(`attachments://foo?noteId=nota24sumber`).not.toMatch(
    ATTACHMENTS_PROTOCOL_REGEX,
  );

  expect(`attach://foo?noteId=${uuid()}`).not.toMatch(
    ATTACHMENTS_PROTOCOL_REGEX,
  );

  expect(`foo?noteId=${uuid()}`).not.toMatch(ATTACHMENTS_PROTOCOL_REGEX);

  expect(`attachments://foo`).not.toMatch(ATTACHMENTS_PROTOCOL_REGEX);
});

test("buildAttachmentUrl", () => {
  expect(() => {
    buildAttachmentUrl("random-url.com", uuid());
  }).toThrow(/Attachment href must start with/);

  const noteId = uuid();
  const href = buildAttachmentUrl(
    `${Protocol.Attachments}://random/file/path.jpg`,
    noteId,
  );
  expect(href).toMatch(ATTACHMENTS_PROTOCOL_REGEX);
});
