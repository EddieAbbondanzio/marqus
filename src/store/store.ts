import { createStore, useStore as baseUseStore, Store } from 'vuex';
import config from '@/store/modules/config';
import { InjectionKey } from 'vue';

export interface State {
    count: number;
    config: any;
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
    state: {
        count: 1
    } as any,
    mutations: {},
    actions: {},
    modules: {
        config
    },
    strict: process.env.NODE_ENV !== 'production' // Major performance hit in prod see: https://next.vuex.vuejs.org/guide/strict.html#development-vs-production
});

// define your own `useStore` composition function
export function useStore() {
    return baseUseStore(key);
}
