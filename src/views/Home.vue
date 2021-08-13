<template>
    <div class="is-flex is-flex-row has-h-100">
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Editor from '@/features/ui/components/editor/Editor.vue';
import LocalNavigation from '@/features/ui/components/local-navigation/LocalNavigation.vue';
import GlobalNavigation from '@/features/ui/components/global-navigation/GlobalNavigation.vue';
import { undo } from '@/store/plugins/undo';

export default defineComponent({
    components: {
        Editor,
        LocalNavigation,
        GlobalNavigation
    }
});
</script>
