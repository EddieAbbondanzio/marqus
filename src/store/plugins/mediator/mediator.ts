import { ActionPayload, Store } from "vuex";

let release: () => void;

type Subscriber = { handler: (action: ActionPayload) => any; once?: boolean };

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
      const sub = subsToNotify[i];

      sub.handler(p);

      if (sub.once) {
        subsToNotify.splice(i, 1);
      }
    }
  },

  subscribe(actionType: string, sub: Subscriber["handler"]) {
    if (this.subscribers[actionType] == null) {
      this.subscribers[actionType] = [{ handler: sub }];
    } else {
      // Do we have a duplicate?
      const existing = this.subscribers[actionType].find(
        (s) => s.handler === sub
      );
      if (existing != null) {
        throw Error(
          `Duplicate mediator subscriber detected for action type ${actionType}`
        );
      }

      this.subscribers[actionType].push({ handler: sub });
    }
  },

  subscribeOnce(actionType: string, sub: Subscriber["handler"]) {
    this.subscribers[actionType] ??= [];
    this.subscribers[actionType].push({ handler: sub, once: true });
  },

  release() {
    if (release != null) {
      release();
    }
  },
};
