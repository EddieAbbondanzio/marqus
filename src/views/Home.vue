<template>
    <div class="is-flex is-flex-row has-h-fullheight">
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Editor from '@/components/Editor/Editor.vue';
import LocalNavigation from '@/components/LocalNavigation.vue';
import GlobalNavigation from '@/components/GlobalNavigation/GlobalNavigation.vue';
import { store } from '@/store/store';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        GlobalNavigation
    }
});
</script>
