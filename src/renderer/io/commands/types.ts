import {
  InputMode,
  Note,
  Notebook,
  Shortcut,
  State,
  Tag,
  UI,
} from "../../../shared/state";
import { StartsWith } from "../../types";

export type Transformer<S> = (previous: S) => S;

export type SetUI = (t: Transformer<UI>) => void;
export type SetTags = (t: Transformer<Tag[]>) => void;
export type SetNotebooks = (t: Transformer<Notebook[]>) => void;
export type SetShortcuts = (t: Transformer<Shortcut[]>) => void;

export interface ExecutionContext {
  getState: () => State;
  setUI: SetUI;
  setTags: SetTags;
  setNotebooks: SetNotebooks;
  setShortcuts: SetShortcuts;
}

export type Command<Input = void> = (
  context: ExecutionContext,
  // Payload is optional to support running as a shortcut
  payload?: Input
) => Promise<void>;

export interface CommandSchema {
  "app.openDevTools": Command;
  "app.reload": Command;
  "app.toggleFullScreen": Command;
  "globalNavigation.updateScroll": Command<number>;
  "globalNavigation.resizeWidth": Command<string>;
  "globalNavigation.createTag": Command;
}
export type CommandType = keyof CommandSchema;

export type CommandsForNamespace<Namespace extends string> = Pick<
  CommandSchema,
  StartsWith<keyof CommandSchema, Namespace>
>;

export interface AwaitableInput {
  mode: InputMode;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
}
export type AwaitableOutcome = "confirm" | "cancel";

export function createAwaitForInput(
  originalValue?: string
): [AwaitableInput, Promise<AwaitableOutcome>] {
  let mode: InputMode = originalValue == null ? "create" : "update";
  let confirm: () => void;
  let cancel: () => void;

  let confirmPromise: Promise<"confirm"> = new Promise(
    (res) => (confirm = () => res("confirm"))
  );
  let cancelPromise: Promise<"cancel"> = new Promise(
    (res) => (cancel = () => res("cancel"))
  );

  const obj: AwaitableInput = {
    mode,
    value: originalValue ?? "",
    onInput: (val: string) => {
      obj.value = val;
    },
    confirm: confirm!,
    cancel: cancel!,
  };

  return [obj, Promise.race([confirmPromise, cancelPromise])];
}
