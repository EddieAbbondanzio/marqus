export abstract class Command<TInput> {
    abstract execute(payload: TInput): Promise<void>;

  // abstract undo(): void | Promise<void>;

  // redo(): void | Promise<void> {
  // //   throw Error("Implement this...");
  // }
}
