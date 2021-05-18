<template>
    <div class="has-background-light is-flex-grow-1 has-text-dark">
        <editor-tabs />
        <editor-toolbar />
        <div class="has-w-50">
            <tag-input
                icon="fa-tag"
                placeholder="Start typing tags"
                v-model:expanded="active"
                v-model:selected="selected"
                v-model:values="available"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue';
import EditorTabs from '@/components/editor/EditorTabs.vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import { store } from '@/store';
import { useStore } from 'vuex';
import TagInput from '@/components/core/form/TagInput.vue';

export default defineComponent({
    setup: (p, c) => {
        const s = useStore();

        const active = ref(false);

        const selected = ref([
            { id: '1', value: 'Cat' },
            { id: '2', value: 'Dog' }
        ]);

        const available = ref([
            { id: '1', value: 'Cat' },
            { id: '2', value: 'Dog' },
            { id: '3', value: 'Horse' },
            { id: '4', value: 'Fish' },
            { id: '5', value: 'Goat' },
            { id: '6', value: 'Goat2' },
            { id: '8', value: 'Bat' },
            { id: '9', value: 'Zebra' },
            { id: '10', value: 'Cow' },
            { id: '11', value: 'Donkey' },
            { id: '12', value: 'Giraffe' }
        ]);

        return {
            active,
            selected,
            available
        };
    },
    components: {
        EditorToolbar,
        EditorTabs,
        TagInput
    }
});
</script>

<style lang="sass" scoped>
textarea
    outline: none!important
    border: none!important
</style>
