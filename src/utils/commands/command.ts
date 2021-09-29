
export abstract class Command {
    abstract execute(): void | Promise<void>;

  // abstract undo(): void | Promise<void>;

  // redo(): void | Promise<void> {
  // //   throw Error("Implement this...");
  // }
}
