import * as monaco from "monaco-editor";
import { IDisposable } from "monaco-editor";

// Fixes: Error: Language id "vs.editor.nullLanguage" is not configured nor known
// See https://github.com/microsoft/monaco-editor/issues/2962
monaco.languages.register({ id: "vs.editor.nullLanguage" });
monaco.languages.setLanguageConfiguration("vs.editor.nullLanguage", {});

const MONACO_SETTINGS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: "markdown",

  // Hide line numbers
  lineNumbers: "off",
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,

  wordWrap: "on",
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  minimap: {
    enabled: false,
  },
  contextmenu: false,
  quickSuggestions: false,
  renderLineHighlight: "none",
};

export function createMonacoInstance(
  el: HTMLElement,
  tabSize: number,
): PatchedIStandaloneCodeEditor {
  const instance = monaco.editor.create(el, {
    value: "",
    ...MONACO_SETTINGS,
    tabSize,
  });

  return instance as PatchedIStandaloneCodeEditor;
}

export interface PatchedIStandaloneCodeEditor
  extends monaco.editor.IStandaloneCodeEditor {
  _standaloneKeybindingService: StandaloneKeybindingService;
  getModel(): ITextModelPausableUndoRedo | null;
}

// StandaloneKeybindingService is not exposed by VS Code's source so we define an
// interface of just the properties we care about. Source:
// https://github.com/microsoft/vscode/blob/c0c1dce86b7188fd63edaf86d69c154fc281f83c/src/vs/editor/standalone/browser/standaloneServices.ts#L475
export interface StandaloneKeybindingService {
  addDynamicKeybinding(
    commandId: string,
    _keybinding: unknown,
    handler: unknown,
    when: unknown | undefined,
  ): IDisposable;
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

export function disableKeybinding(
  editor: PatchedIStandaloneCodeEditor,
  commandId: string,
): void {
  // See: https://github.com/microsoft/monaco-editor/issues/102
  const { _standaloneKeybindingService } = editor;

  _standaloneKeybindingService.addDynamicKeybinding(
    `-${commandId}`,
    undefined,
    () => void undefined,
    undefined,
  );
}
