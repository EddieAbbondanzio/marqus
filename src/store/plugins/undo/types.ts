import { UndoModule } from '@/store/plugins/undo/undo-module';
import { Commit, MutationPayload, Store } from 'vuex';

export interface UndoState {
    release?: () => void;
    store: Store<any>;
    modules: { [namespace: string]: UndoModule };
}

export interface UndoModuleSettings {
    name: string;
    namespace: string;
    setStateMutation: string;
    stateCacheInterval: number;
    ignore?: string[];
}

export interface UndoMetadata {
    groupId?: string;
    isReplay?: boolean;
}

/**
 * Unit of work group that can contain 1 or more mutations.
 */
export interface UndoGroup {
    id: string;
    mutations: MutationPayload[];
}

export type UndoItemOrGroup = MutationPayload | UndoGroup;

/**
 * Type discriminator for undo groups and mutations.
 * @param e The event to check.
 * @returns True if the parameter passed is a group.
 */
export function isUndoGroup(e: UndoItemOrGroup): e is UndoGroup {
    if ((e as any).mutations != null) {
        return true;
    } else {
        return false;
    }
}
