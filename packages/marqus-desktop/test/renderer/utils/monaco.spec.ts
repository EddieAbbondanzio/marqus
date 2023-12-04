import { createMarkdownModel } from "../../../src/renderer/utils/monaco";
import * as monaco from "monaco-editor";

test("createMarkdownModel", () => {
  const model = {
    getEOL: jest.fn().mockReturnValue("\n"),
    getLineCount: jest.fn().mockReturnValue(2),
    // TODO: Make helper mock for creating models since we use internal APIS now
    _commandManager: {
      _undoRedoService: {},
    },
  };
  (monaco.editor.createModel as jest.Mock).mockReturnValueOnce(model);

  createMarkdownModel("foo");
  expect(monaco.editor.createModel).toHaveBeenCalledWith("foo", "markdown");
});
