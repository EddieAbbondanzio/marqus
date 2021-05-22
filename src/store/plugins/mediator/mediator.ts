import { State } from '@/store/state';
import { MutationPayload, Store } from 'vuex';

let release: () => void;

type Subscriber = (mutation: MutationPayload, state: State) => any;

export const mediator = {
    subscribers: {} as { [mutationType: string]: Subscriber[] },

    plugin(store: Store<State>) {
        release = store.subscribe(mediator.notify.bind(mediator));
    },

    notify(p: MutationPayload, s: State) {
        const subsToNotify = this.subscribers[p.type];

        if (subsToNotify == null) {
            return;
        }

        for (let i = 0; i < subsToNotify.length; i++) {
            subsToNotify[i](p, s);
        }
    },

    subscribe(mutationType: string, fn: Subscriber) {
        if (this.subscribers[mutationType] == null) {
            this.subscribers[mutationType] = [fn];
        } else {
            // Do we have a duplicate?
            const existing = this.subscribers[mutationType].find((s) => s === fn);
            if (existing != null) {
                throw Error(`Duplicate mediator subscriber detected for mutation type ${mutationType}`);
            }

            this.subscribers[mutationType].push(fn);
        }
    },

    release() {
        if (release != null) {
            release();
        }
    }
};
