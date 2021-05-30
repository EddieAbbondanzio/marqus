<template>
    <div class="is-flex is-flex-row has-h-fullheight">
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Editor from '@/modules/app/components/editor/Editor.vue';
import LocalNavigation from '@/modules/app/components/local-navigation/LocalNavigation.vue';
import GlobalNavigation from '@/modules/app/components/global-navigation/GlobalNavigation.vue';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        GlobalNavigation
    }
});
</script>
