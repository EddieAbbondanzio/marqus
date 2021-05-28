import { EventBase } from '@/store/core/event-base';
import { EventHistory } from '@/store/core/event-history';

/**
 * Generates the APPLY, UNDO, and REDO mutations to support event sourcing. Will also handle all
 * state logic for moving back and forth in time when the user wants to jump back or forward.
 */
export function mapEventSourcedMutations<S, T extends EventBase>({
    apply,
    undo,
    history
}: {
    apply: (state: S, event: T) => void;
    undo: (state: S, event: T) => void;
    history: (state: S) => EventHistory<T>;
}): {
    APPLY: (state: S, event: T) => void;
    UNDO: (state: S) => void;
    REDO: (state: S) => void;
} {
    return {
        APPLY(state: S, event: T) {
            const h = history(state);

            apply(state, event);
            h.push(event);
        },
        UNDO(state: S) {
            const h = history(state);

            if (h.canRewind()) {
                const event = h.rewind();
                undo(state, event);
            }
        },
        REDO(state: S) {
            const h = history(state);

            if (h.canFastForward()) {
                const event = h.fastForward();
                apply(state, event);
            }
        }
    };
}
