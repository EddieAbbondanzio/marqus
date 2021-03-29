<template>
    <Collapse v-if="modelValue.children" :modelValue="true">
        <template #trigger>
            <div class="is-flex is-align-center mb-1">
                <span class="is-size-7 is-uppercase">{{ modelValue.value }}</span>
            </div>
        </template>

        <ul class="is-size-7" style="margin-left: 24px;" v-for="child in modelValue.children" :key="child.id">
            <GlobalNavigationNotebook :modelValue="child" />
        </ul>
    </Collapse>
    <li v-else class="mb-1">
        <p class="global-navigation-notebook" :data-id="modelValue.id">{{ modelValue.value }}</p>
    </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Collapse from '@/components/Collapse.vue';
import { Notebook } from '@/store/modules/editor/state';

export default defineComponent({
    props: {
        modelValue: Object
    },
    name: 'GlobalNavigationNotebook',
    components: { Collapse }
});
</script>
