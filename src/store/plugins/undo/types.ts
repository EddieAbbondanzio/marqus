import { UndoContext } from '@/store/plugins/undo/undo-context';
import { Commit, MutationPayload, Store } from 'vuex';

export interface UndoState {
    release?: () => void;
    store: Store<any>;
    contexts: { [namespace: string]: UndoContext };
}

export interface UndoContextSettings {
    id?: string;
    name?: string;
    namespace: string;
    setStateMutation?: string;
    stateCacheInterval?: number;
    ignore?: string[];
}

export type UndoReplayMode = 'undo' | 'redo';

export type UndoCallback = (mutation: MutationPayload) => any;

export interface UndoMetadata {
    group?: {
        id: string;
        namespace: string;
    };
    cache?: any;
    isReplay?: boolean;
    ignore?: boolean;
    undoCallback?: UndoCallback;
    redoCallback?: UndoCallback;
}

export interface UndoPayload<T> {
    value: T;
    _undo?: UndoMetadata; // _undo is intentional. Since the plugin name is undo it can lead to errors because it's easy to pass by accident.
}

export interface VoidUndoPayload {
    _undo?: UndoMetadata;
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
