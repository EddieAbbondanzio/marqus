import React from "react";
import {
  generateAttachmentLink,
  Monaco,
} from "../../../src/renderer/components/Monaco";
import { createNote } from "../../../src/shared/domain/note";
import { createStore } from "../../__factories__/store";
import { fireEvent, render } from "@testing-library/react";
import { uuid } from "../../../src/shared/domain";
import * as monaco from "monaco-editor";
import { Section } from "../../../src/shared/ui/app";
import { when } from "jest-when";
import { Protocol } from "../../../src/shared/domain/protocols";
import { createConfig } from "../../__factories__/config";

test("importAttachments", async () => {
  const noteId = uuid();
  const note = createNote({ id: noteId, name: "foo", content: "foo\nbar" });
  const store = createStore({
    notes: [note],
    editor: {
      activeTabNoteId: noteId,
      tabs: [{ note }],
    },
    focused: [Section.Editor],
  });
  const config = createConfig();

  const r = render(<Monaco store={store.current} config={config} />);
  const monacoContainer = r.getByTestId("monaco-container");

  const model = {
    getEOL: jest.fn().mockReturnValue("\n"),
    getLineCount: jest.fn().mockReturnValue(2),
    // TODO: Make helper mock for creating models since we use internal APIS now
    _commandManager: {
      _undoRedoService: {},
    },
  };
  const monacoEditor = {
    getModel: jest.fn().mockReturnValue(model),
    // TODO: Add custom support for getPosition here.
    // Test needs to simulate removing the path monaco inserts by default.
    setPosition: jest.fn(),
    trigger: jest.fn(),
    onDidChangeModelContent: jest.fn(),
    setModel: jest.fn(),
    dispose: jest.fn(),
  };
  (monaco.editor.create as jest.Mock).mockReturnValue(monacoEditor);
  (monaco.editor.createModel as jest.Mock).mockReturnValueOnce(model);

  when((window as any).ipc as jest.Mock)
    .calledWith("notes.importAttachments", noteId, expect.anything())
    .mockResolvedValueOnce([
      {
        name: "foo.jpg",
        type: "image",
        path: "foo.jpg",
      },
      {
        name: "bar.txt",
        type: "file",
        path: "bar.txt",
      },
    ]);

  // Drop event sends file info over ipc
  fireEvent.drop(monacoContainer, {
    dataTransfer: {
      files: {
        0: {
          name: "foo.jpg",
          path: "random/path/foo.jpg",
          type: "image/jpeg",
        },
        1: {
          name: "bar.txt",
          path: "random/path/bar.txt",
          type: "text/plain",
        },
      },
    },
  });

  expect((window as any).ipc).toHaveBeenCalledWith(
    "notes.importAttachments",
    noteId,
    [
      {
        name: "foo.jpg",
        path: "random/path/foo.jpg",
        mimeType: "image/jpeg",
      },
      {
        name: "bar.txt",
        path: "random/path/bar.txt",
        mimeType: "text/plain",
      },
    ],
  );
});

test("generateAttachmentLink", () => {
  expect(
    generateAttachmentLink({
      name: "foo.txt",
      path: "foo.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[foo.txt](${Protocol.Attachment}://foo.txt)`);

  expect(
    generateAttachmentLink({
      name: "bar.txt",
      path: "nested/bar.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[bar.txt](${Protocol.Attachment}://nested/bar.txt)`);

  expect(
    generateAttachmentLink({
      name: "foo bar.txt",
      path: "foo bar.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[foo bar.txt](${Protocol.Attachment}://foo%20bar.txt)`);

  expect(
    generateAttachmentLink({
      name: "baz.jpg",
      path: "baz.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://baz.jpg)`);

  expect(
    generateAttachmentLink({
      name: "qux.jpg",
      path: "nested/qux.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://nested/qux.jpg)`);

  expect(
    generateAttachmentLink({
      name: "two words.jpg",
      path: "two words.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://two%20words.jpg)`);
});
