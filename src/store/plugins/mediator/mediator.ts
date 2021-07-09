import { MutationPayload, Store } from 'vuex';

let release: () => void;
let store: Store<any>;

type Subscriber = (mutation: MutationPayload, store: Store<any>) => any;

export const mediator = {
    subscribers: {} as { [mutationType: string]: Subscriber[] },

    plugin(s: Store<any>) {
        release = s.subscribe(mediator.notify.bind(mediator));
        store = s;
    },

    notify(p: MutationPayload, s: any) {
        const subsToNotify = this.subscribers[p.type];

        if (subsToNotify == null) {
            return;
        }

        for (let i = 0; i < subsToNotify.length; i++) {
            subsToNotify[i](p, store);
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
