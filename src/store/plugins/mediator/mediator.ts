import { State } from "@/store/state";
import { MutationPayload, Store } from "vuex";

export interface Subscriber { mutationType: string; }

export const mediator = {
    plugin(store: Store<State>) {
        store.subscribe(
            function(this: typeof mediator, p: MutationPayload, s: State) {
                
            }
        )
    },

    subscribe(mutationType: string, fn: (mutation: MutationPayload, state: State) => any) {

    }
}
