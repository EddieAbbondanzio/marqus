import React from "react";
import {
  generateAttachmentMarkdown,
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
import * as utils from "../../../src/renderer/utils/monaco";

test("importAttachments", async () => {
  jest.spyOn(utils, "disableKeybinding").mockImplementation(jest.fn());

  const executeEdits = jest.fn();

  // TODO: Commonize this better.
  (monaco.editor.create as jest.Mock).mockImplementationOnce(() => ({
    getPosition: jest.fn().mockImplementation(() => ({
      lineNumber: 0,
      column: 100,
      delta: () => ({
        lineNumber: 0,
        column: -39,
      }),
    })),
    _standaloneKeybindingService: { addDynamicKeybind: jest.fn() },
    onDidChangeModelContent: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    onDidChangeCursorPosition: jest
      .fn()
      .mockReturnValue({ dispose: jest.fn() }),
    onDidChangeCursorSelection: jest
      .fn()
      .mockReturnValue({ dispose: jest.fn() }),
    onDidScrollChange: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    dispose: jest.fn(),
    executeEdits,
    focus: jest.fn(),
    setModel: jest.fn(),
    restoreViewState: jest.fn(),
    getModel: jest.fn().mockReturnValueOnce({
      resumeUndoRedoTracking: jest.fn(),
      stopUndoRedoTracking: jest.fn(),
      getEOL: jest.fn().mockReturnValue("\n"),
    }),
  }));

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
  store.current.on("editor.setModelViewState", jest.fn());
  const config = createConfig();

  const r = render(<Monaco store={store.current} config={config} />);
  const monacoContainer = r.getByTestId("monaco-container");

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

  // Ensure default behavior of pasting paths is removed.
  expect(executeEdits).toHaveBeenCalledWith(
    "",
    expect.arrayContaining([
      {
        range: expect.objectContaining({
          endLineNumber: 0,
          endColumn: 100,
          startLineNumber: 0,
          startColumn:
            0 - ["random/path/foo.jpg", "random/path/bar.txt"].join(" ").length,
        }),
        text: "",
      },
    ]),
  );

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
    generateAttachmentMarkdown({
      name: "foo.txt",
      path: "foo.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[foo.txt](${Protocol.Attachment}://foo.txt)`);

  expect(
    generateAttachmentMarkdown({
      name: "bar.txt",
      path: "nested/bar.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[bar.txt](${Protocol.Attachment}://nested/bar.txt)`);

  expect(
    generateAttachmentMarkdown({
      name: "foo bar.txt",
      path: "foo bar.txt",
      mimeType: "text/plain",
      type: "file",
    }),
  ).toBe(`[foo bar.txt](${Protocol.Attachment}://foo%20bar.txt)`);

  expect(
    generateAttachmentMarkdown({
      name: "baz.jpg",
      path: "baz.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://baz.jpg)`);

  expect(
    generateAttachmentMarkdown({
      name: "qux.jpg",
      path: "nested/qux.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://nested/qux.jpg)`);

  expect(
    generateAttachmentMarkdown({
      name: "two words.jpg",
      path: "two words.jpg",
      mimeType: "image/jpeg",
      type: "image",
    }),
  ).toBe(`![](${Protocol.Attachment}://two%20words.jpg)`);
});
