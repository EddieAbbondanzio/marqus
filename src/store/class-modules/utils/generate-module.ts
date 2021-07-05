import { VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { Module } from 'vuex';

export function generateModule(definition: VuexModuleDefinition): Module<any, any> {
    console.log(definition);
    return {
        namespaced: true,
        mutations: definition.mutations,
        actions: definition.actions
    };
}
