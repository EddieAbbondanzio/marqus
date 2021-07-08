import { VuexModuleConstructor } from '@/store/common/class-modules/vuex-module';
import { PersistModuleSettings } from '@/store/plugins/persist';
import { persist } from '@/store/plugins/persist/persist';

export function Persist(options: PersistModuleSettings) {
    return (target: VuexModuleConstructor) => {
        persist.register(options);
    };
}
