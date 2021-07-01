import { UndoModule } from '@/store/plugins/undo/undo-module';
import { TaskScheduler } from '@/utils/task-scheduler';
import { MutationPayload } from 'vuex';

export interface UndoState {
    release?: () => void;
    modules: { [namespace: string]: UndoModule };
    schedulers: { [namespace: string]: TaskScheduler };
}

export interface UndoModuleSettings {
    namespace: string;
    setStateMutation: string;
    stateCacheInterval: number;
}

/**
 * Unit of work group that can contain 1 or more mutations.
 */
export interface UndoGroup {
    id: string;
    mutations: MutationPayload[];
}

export type UndoItem = MutationPayload & { undoGroup?: string };

export type UndoHistoryEvent = UndoGroup | MutationPayload;

/**
 * Type discriminator for undo groups and mutations.
 * @param e The event to check.
 * @returns True if the parameter passed is a group.
 */
export function isUndoGroup(e: UndoHistoryEvent): e is UndoGroup {
    if ((e as any).id != null) {
        return true;
    } else {
        return false;
    }
}
