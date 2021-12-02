export type ConfirmOrCancel = [
  /**
   * Callback to trigger when user wishes to save input
   */
  confirm: (value: string) => void,
  /**
   * Callback to trigger when the user wants to cancel input
   */
  cancel: () => void,
  /**
   * Awaitable promise that is resolved upon confirm or cancel.
   */
  response: Promise<[outcome: "confirm" | "cancel", value?: string]>
];

/**
 * Helper to await user input that can be categorized as yay or nay.
 * Useful for performing finalizing actions such as creating resources
 * when a user confirms it, or reverting state if they wish to cancel.
 */
export function createConfirmOrCancel(): ConfirmOrCancel {
  let confirm: (value: string) => void;
  let cancel: () => void;

  let confirmPromise: Promise<["confirm", string]> = new Promise(
    (res) => (confirm = (v) => res(["confirm", v]))
  );
  let cancelPromise: Promise<["cancel"]> = new Promise(
    (res) => (cancel = () => res(["cancel"]))
  );

  return [confirm!, cancel!, Promise.race([confirmPromise, cancelPromise])];
}
