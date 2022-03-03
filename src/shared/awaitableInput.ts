import { Nullable } from "tsdef";
import * as yup from "yup";

export type InputMode = "create" | "update";

export interface AwaitableInput {
  id?: string;
  mode: InputMode;
  initialValue: string;
  // Render use only
  value: string;
  onInput: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  schema: any;
  completed: Promise<[value: string, action: AwaitableOutcome]>;
  parentId?: string;
}
export type AwaitableParams = {
  value?: string;
  id?: string;
  schema: yup.StringSchema;
  parentId?: string;
};
export type AwaitableOutcome = "confirm" | "cancel";

export function createAwaitableInput(
  params: AwaitableParams,
  setValue: (value: string) => void
): AwaitableInput {
  let mode: InputMode = params.id == null ? "create" : "update";
  let confirm: () => void;
  let cancel: () => void;
  let outcome: Nullable<string>;
  let value = params.value ?? "";

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

  const promise = Promise.race([confirmPromise, cancelPromise]);

  const obj: AwaitableInput = {
    id: params.id,
    mode,
    initialValue: value,
    value,
    onInput: wrappedSetValue,
    confirm: confirm!,
    cancel: cancel!,
    schema: params.schema,
    completed: promise,
    parentId: params.parentId,
  };

  return obj;
}
