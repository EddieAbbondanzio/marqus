<template>
    <div class="is-flex is-flex-row has-h-100">
        <command-modal />
        <global-navigation />
        <local-navigation />
        <editor />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Editor from "@/components/Editor.vue";
import LocalNavigation from "@/components/LocalNavigation.vue";
import GlobalNavigation from "@/components/GlobalNavigation.vue";
import CommandModal from "@/components/CommandModal.vue";

export default defineComponent({
  components: {
    CommandModal,
    Editor,
    LocalNavigation,
    GlobalNavigation
  }
});
</script>
