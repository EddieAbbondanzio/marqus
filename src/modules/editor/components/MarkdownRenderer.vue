<template>
    <div class="content p-3" v-html="content"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import marked from 'marked';
import { mapMutations, useStore } from 'vuex';

export default defineComponent({
    setup: () => {
        const s = useStore();
        const activeTab = s.getters['app/editor/activeTab'];

        const content = marked(activeTab.content);

        return { content };
    }
});
</script>
