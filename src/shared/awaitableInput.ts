import { Nullable } from "tsdef";
import * as yup from "yup";

export type InputMode = "create" | "update";

export interface AwaitableInput {
  id?: string;
  mode: InputMode;
  // Render use only
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  schema: any;
}
export type AwaitableOutcome = "confirm" | "cancel";

export function createAwaitableInput(
  params: { value: string; id?: string; schema: yup.StringSchema },
  setValue: (value: string) => void
): [AwaitableInput, Promise<[value: string, action: AwaitableOutcome]>] {
  let mode: InputMode = params.id == null ? "create" : "update";
  let confirm: () => void;
  let cancel: () => void;
  let outcome: Nullable<string>;
  let value = params.value;

  let confirmPromise: Promise<[value: string, action: "confirm"]> = new Promise(
    (res) =>
      (confirm = () => {
        outcome = "confirm";
        res([value, "confirm"]);
      })
  );
  let cancelPromise: Promise<[value: string, action: "cancel"]> = new Promise(
    (res) =>
      (cancel = () => {
        outcome = "cancel";
        res([value, "cancel"]);
      })
  );

  const wrappedSetValue = (val: string) => {
    if (outcome != null) {
      return;
    }

    value = val;
    setValue(val);
  };

  const obj: AwaitableInput = {
    id: params.id,
    mode,
    value,
    onInput: wrappedSetValue,
    confirm: confirm!,
    cancel: cancel!,
    schema: params.schema,
  };

  return [obj, Promise.race([confirmPromise, cancelPromise])];
}
