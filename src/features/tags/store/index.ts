import { store, registerModule } from '@/store';
import { TagStore } from '@/features/tags/store/tag-store';
import { persist } from '@/store/plugins/persist/persist';

// export default {
//     namespaced: true,
//     state,
//     getters,
//     actions,
//     mutations
// };

persist.register({
    namespace: 'tags',
    fileName: 'tags.json',
    initMutation: 'SET_STATE'
});
