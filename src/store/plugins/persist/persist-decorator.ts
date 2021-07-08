import { PersistModuleSettings } from '@/store/plugins/persist';
import { persist } from '@/store/plugins/persist/persist';

export function Persist(options: PersistModuleSettings) {
    return (target: any) => {
        persist.register(options);
    };
}
