<template>
    <div class="is-flex is-flex-row has-h-fullheight">
        <root-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from '@/components/Editor.vue';
import LocalNavigation from '@/components/LocalNavigation.vue';
import RootNavigation from '@/components/RootNavigation.vue';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        RootNavigation
    }
});
</script>
