import * as monaco from "monaco-editor";

export interface PatchedIStandaloneCodeEditor
  extends monaco.editor.IStandaloneCodeEditor {
  getModel(): ITextModelPausableUndoRedo | null;
}

// IUndoRedoService is not exposed by VS Code's source so we define an interface
// of just the properties we care about. Source file:
// https://github.com/microsoft/vscode/blob/f0d15e28789098cbb6390f793d27e71a85fa5537/src/vs/platform/undoRedo/common/undoRedo.ts#L179
export interface IUndoRedoService {
  /**
   * Add a new element to the `undo` stack.
   * This will destroy the `redo` stack.
   */
  pushElement(element: unknown, group?: unknown, source?: unknown): void;
}

// EditStack is not exposed by VS Code's source so we define an interface of
// just the properties we care about. Source file:
// https://github.com/microsoft/vscode/blob/f0d15e28789098cbb6390f793d27e71a85fa5537/src/vs/editor/common/model/textModel.ts#L264
export interface EditStack {
  _undoRedoService: IUndoRedoService;
}

export interface ITextModelPausableUndoRedo extends monaco.editor.ITextModel {
  _commandManager: EditStack;
  stopUndoRedoTracking(): void;
  resumeUndoRedoTracking(): void;
}

export function createMarkdownModel(content = ""): ITextModelPausableUndoRedo {
  const model = monaco.editor.createModel(
    content,
    // N.B. Language needs to be specified for syntax highlighting.
    "markdown",
  );

  return patchMonacoForPausableUndoRedo(model);
}

export function patchMonacoForPausableUndoRedo(
  model: monaco.editor.ITextModel,
): ITextModelPausableUndoRedo {
  // Technique inspired from: https://github.com/microsoft/monaco-editor/issues/686#issuecomment-1551285660

  const {
    _commandManager: { _undoRedoService },
  } = model as ITextModelPausableUndoRedo;
  const { pushElement } = _undoRedoService;

  // Patch model to pause undo redo tracking by swapping out pushElement with a
  // noop so no new actions can be added by Monaco.

  const patchedModel = model as ITextModelPausableUndoRedo;
  patchedModel.stopUndoRedoTracking = () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    _undoRedoService.pushElement = () => {};
  };
  patchedModel.resumeUndoRedoTracking = () => {
    _undoRedoService.pushElement = pushElement;
  };

  return patchedModel;
}
