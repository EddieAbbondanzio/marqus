import { Nullable } from "tsdef";

export type InputMode = "create" | "update";

export interface AwaitableInput {
  id?: string;
  mode: InputMode;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
}
export type AwaitableOutcome = "confirm" | "cancel";

export function createAwaitableInput(
  params: { value: string; id?: string },
  setValue: (value: string) => void
): [AwaitableInput, Promise<AwaitableOutcome>] {
  let mode: InputMode = params.id == null ? "create" : "update";
  let confirm: () => void;
  let cancel: () => void;
  let outcome: Nullable<string>;

  let confirmPromise: Promise<"confirm"> = new Promise(
    (res) =>
      (confirm = () => {
        outcome = "confirm";
        res("confirm");
      })
  );
  let cancelPromise: Promise<"cancel"> = new Promise(
    (res) =>
      (cancel = () => {
        outcome = "cancel";
        res("cancel");
      })
  );

  const wrappedSetValue = (value: string) => {
    if (outcome != null) {
      return;
    }

    setValue(value);
  };

  const obj: AwaitableInput = {
    id: params.id,
    mode,
    value: params.value,
    onInput: wrappedSetValue,
    confirm: confirm!,
    cancel: cancel!,
  };

  return [obj, Promise.race([confirmPromise, cancelPromise])];
}
