import { isEmpty } from "lodash";
import { Nullable } from "tsdef";
import { z, ZodError } from "zod";

// TODO: Can we find a better spot for this? The file feels out of place.

export type InputMode = "create" | "update";

export interface PromisedInput {
  id?: string;
  mode: InputMode;
  value: string;
  onChange: (value: string) => void;
  confirm: () => void;
  cancel: () => void;
  validate: (value: string) => ValidateOutcome;
  completed: Promise<[value: string, action: PromisedOutcome]>;
  parentId?: string;
}
type ValidateOutcome = { valid: true } | { valid: false; errors: string[] };

export type PromisedInputParams = {
  value?: string;
  id?: string;
  schema: z.ZodString | z.ZodNumber;
  parentId?: string;
};
export type PromisedOutcome = "confirm" | "cancel";

export function createPromisedInput(
  params: PromisedInputParams,
  setValue: (value: string) => void
): PromisedInput {
  const mode: InputMode = params.id == null ? "create" : "update";
  let confirm: () => void;
  let cancel: () => void;
  let outcome: Nullable<string>;
  let value = params.value ?? "";

  const confirmPromise: Promise<[value: string, action: "confirm"]> =
    new Promise(
      (res) =>
        (confirm = () => {
          if (isEmpty(value)) {
            return;
          }

          outcome = "confirm";
          res([value, "confirm"]);
        })
    );
  const cancelPromise: Promise<[value: string, action: "cancel"]> = new Promise(
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
  const validate = (value: string): ValidateOutcome => {
    try {
      params.schema.parse(value);
      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        errors: (e as ZodError).issues.map((i) => i.message),
      };
    }
  };

  const obj: PromisedInput = {
    id: params.id,
    mode,
    value,
    onChange: wrappedSetValue,
    confirm: confirm!,
    cancel: cancel!,
    validate,
    completed: promise,
    parentId: params.parentId,
  };

  return obj;
}
