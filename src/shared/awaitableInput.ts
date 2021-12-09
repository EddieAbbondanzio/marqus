export type InputMode = "create" | "update";

export interface AwaitableInput {
  mode: InputMode;
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
}
export type AwaitableOutcome = "confirm" | "cancel";

export function createAwaitableInput(
  value: string,
  setValue: (value: string) => void
): [AwaitableInput, Promise<AwaitableOutcome>] {
  let mode: InputMode = value == "" ? "create" : "update";
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
    value: value ?? "",
    onInput: setValue,
    confirm: confirm!,
    cancel: cancel!,
  };

  return [obj, Promise.race([confirmPromise, cancelPromise])];
}
