import { undo } from '@/store/plugins/undo/undo';

/**
 * Helper to map undo / redo methods to component templates.
 * @param opts Id or name of the context.
 * @returns
 */
export function mapUndoRedo(opts: { id?: string; name?: string }) {
    const context = undo.getContext(opts);
    return {
        undo: context.tryUndo,
        redo: context.tryRedo
    };
}
