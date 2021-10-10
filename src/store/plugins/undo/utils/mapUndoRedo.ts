// import { undo } from "@/store/plugins/undo/undo";

/**
 * Helper to map undo / redo methods to component templates.
 * @param opts Id or name of the context.
 * @returns
 */
export function mapUndoRedo(opts: { id?: string; name?: string }) {
  // const context = undo.getModule(opts);

  /*
   * Soft fail undo / redo are returned because we don't want the user to have the program throw an exception
   * just because they didn't have anything they could undo, or redo.
   */
  return {
    undo: () => 1 as any, // context.tryUndo,
    redo: () => 1 as any, //context.tryRedo
  };
}
