import { ActionPayload, Store } from "vuex";

let release: () => void;

type Subscriber = (action: ActionPayload) => any;

export const mediator = {
  subscribers: {} as { [mutationType: string]: Subscriber[] },

  plugin(s: Store<any>) {
    release = s.subscribeAction(mediator.notify.bind(mediator));
  },

  notify(p: ActionPayload) {
    const subsToNotify = this.subscribers[p.type];

    if (subsToNotify == null) {
      return;
    }

    for (let i = 0; i < subsToNotify.length; i++) {
      subsToNotify[i](p);
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
