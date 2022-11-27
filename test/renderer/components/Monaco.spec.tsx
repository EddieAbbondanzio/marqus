import React from "react";
import { Monaco } from "../../../src/renderer/components/Monaco";
import { createNote } from "../../../src/shared/domain/note";
import { createStore } from "../../__factories__/store";
import { fireEvent, render } from "@testing-library/react";
import { uuid } from "../../../src/shared/domain";
import * as monaco from "monaco-editor";
import { Section } from "../../../src/shared/ui/app";
import { when } from "jest-when";
import { sleep } from "../../../src/shared/utils";

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

  const r = render(<Monaco store={store.current} />);
  const monacoContainer = r.getByTestId("monaco-container");

  const model = {
    getEOL: jest.fn().mockReturnValue("\n"),
    getLineCount: jest.fn().mockReturnValue(2),
  };
  const monacoEditor = {
    getModel: jest.fn().mockReturnValue(model),
    setPosition: jest.fn(),
    trigger: jest.fn(),
    onDidChangeModelContent: jest.fn(),
    setModel: jest.fn(),
    dispose: jest.fn(),
  };
  (monaco.editor.create as jest.Mock).mockReturnValueOnce(monacoEditor);
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
