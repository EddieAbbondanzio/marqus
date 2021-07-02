import { UndoModule } from '@/store/plugins/undo/undo-module';
import { Commit, MutationPayload } from 'vuex';

export interface UndoState {
    release?: () => void;
    modules: { [namespace: string]: UndoModule };
}

export interface UndoModuleSettings {
    name: string;
    namespace: string;
    setStateMutation: string;
    stateCacheInterval: number;
    ignore?: string[];
}

/**
 * Unit of work group that can contain 1 or more mutations.
 */
export interface UndoGroup {
    id: string;
    mutations: MutationPayload[];
}

export type UndoItem = MutationPayload & { id: string; undoGroup?: string };

export type UndoHistoryEvent = UndoGroup | UndoItem;

/**
 * Type discriminator for undo groups and mutations.
 * @param e The event to check.
 * @returns True if the parameter passed is a group.
 */
export function isUndoGroup(e: UndoHistoryEvent): e is UndoGroup {
    if ((e as any).mutations != null) {
        return true;
    } else {
        return false;
    }
}
