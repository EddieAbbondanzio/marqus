<template>
    <div class="is-flex is-flex-row has-h-fullheight">
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from '@/components/editor/Editor.vue';
import LocalNavigation from '@/components/local-navigation/LocalNavigation.vue';
import GlobalNavigation from '@/components/global-navigation/GlobalNavigation.vue';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        GlobalNavigation
    }
});
</script>
