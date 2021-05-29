<template>
    <div class="is-flex is-flex-row has-h-fullheight">
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from '@/modules/editor/components/Editor.vue';
import LocalNavigation from '@/modules/local-navigation/components/LocalNavigation.vue';
import GlobalNavigation from '@/modules/global-navigation/components/GlobalNavigation.vue';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        GlobalNavigation
    }
});
</script>
