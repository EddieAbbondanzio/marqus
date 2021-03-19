<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import { store } from './store/store';

export default {
    setup() {
        onMounted((): void => {
            store.dispatch('config/load');
            store.dispatch('editor/load');
        });
    }
};
</script>
