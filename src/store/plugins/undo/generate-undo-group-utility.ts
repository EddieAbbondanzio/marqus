import { UndoMetadata } from '@/store/plugins/undo/types';
import { undo } from '@/store/plugins/undo/undo';

/**
 * Generate a helper method to assist with starting and stopping mutation groups
 * for the undo plugin.
 * @param name The name of the module to generate it for.
 * @returns Helper method to group commits together as units of
 * work for the undo plugin.
 */
export function generateUndoGroupUtil(name: string) {
    /*
     * This is a little convuluted, but done out of necessity. We can't just call .getModule
     * in the actions module because the module hasn't been registered yet. Which means the
     * method call will throw an error.
     *
     * This is kind of a band-aid fix for now until a better solution can be thought of.
     */
    return (handle: (undo: UndoMetadata) => any) => {
        const m = undo.getModule('globalNavigation');
        return m.group(handle);
    };
}
