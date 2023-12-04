import * as monaco from "monaco-editor";

// IUndeRedoService is not exposed by VS Code's source so we define an interface
// of just the properties we care about here.
// https://github.com/microsoft/vscode/blob/f0d15e28789098cbb6390f793d27e71a85fa5537/src/vs/platform/undoRedo/common/undoRedo.ts#L179
export interface PartialIUndoRedoService {
  /**
   * Add a new element to the `undo` stack.
   * This will destroy the `redo` stack.
   */
  pushElement(element: unknown, group?: unknown, source?: unknown): void;
}

export interface ITextModelWithUndoRedoControl
  extends monaco.editor.ITextModel {
  stopUndoRedoTracking(): void;
  resumeUndoRedoTracking(): void;
}

// Pretty hacky. Borrowing technique from: https://github.com/microsoft/monaco-editor/issues/686#issuecomment-1551285660
export function patchMonacoForUndoRedoControl(
  model: monaco.editor.ITextModel,
): ITextModelWithUndoRedoControl {
  const undoRedoService: PartialIUndoRedoService = (
    model as unknown as {
      _commandManager: { _undoRedoService: PartialIUndoRedoService };
    }
  )._commandManager._undoRedoService;
  const pushElement = undoRedoService.pushElement;

  const stopUndoRedoTracking = () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    undoRedoService.pushElement = () => {};
  };

  const resumeUndoRedoTracking = () => {
    undoRedoService.pushElement = pushElement;
  };

  const patchedModel = model as ITextModelWithUndoRedoControl;
  patchedModel.stopUndoRedoTracking = stopUndoRedoTracking;
  patchedModel.resumeUndoRedoTracking = resumeUndoRedoTracking;

  return patchedModel;
}
