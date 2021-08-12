<template>
    <span class="icon">
        <i :class="iconClasses"></i>
    </span>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    setup(p) {
        const iconClasses = computed(() => [`fas ${p.icon}`, p.size]);

        return { iconClasses };
    },
    props: {
        /**
         * Font awesome icon name 'fa-create'.
         */
        icon: {
            type: String,
            default: ''
        },
        /**
         * Bulma typography text size 'is-size-5'.
         */
        size: {
            type: String,
            default: 'is-size-7'
        }
    }
});
</script>
