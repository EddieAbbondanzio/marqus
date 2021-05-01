<template>
    <div>
        <a
            :class="{
                'is-block': true,
                'has-background-light': active
            }"
            :style="`padding-left: ${indent}!important;`"
        >
            <div
                class="px-2 has-background-hover-light has-text-grey is-flex is-justify-content-space-between is-align-center"
                style="height: 30px!important;"
            >
                <div class="is-flex is-align-center has-background-transparent">
                    <span class="icon" v-if="icon">
                        <i :class="`fas fa-${icon}`"></i>
                    </span>

                    <slot name="label">
                        <p>{{ label }}</p>
                    </slot>
                </div>

                <!-- Expand / Collapse button -->
                <slot name="trigger" :toggle="toggle" v-if="hasChildren">
                    <a @click.prevent.stop="toggle" class="is-flex">
                        <icon-button
                            icon="fa-chevron-down"
                            v-if="isExpanded()"
                            class="p-1"
                            style="height: 30px!important"
                        />
                        <icon-button icon="fa-chevron-up" v-else class="p-1" style="height: 30px!important" />
                    </a>
                </slot>
            </div>
        </a>

        <!-- Children -->
        <div class="has-background-transparent" v-if="hasChildren">
            <slot> </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    props: {
        active: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        },
        expanded: {
            type: Boolean,
            default: false
        },
        indent: {
            type: String,
            default: '0px'
        }
    },
    setup(p, { slots, emit }) {
        const localExpanded = ref(p.expanded);
        const hasChildren = computed(() => !!slots.default);

        const toggle = () => {
            localExpanded.value = !localExpanded.value;
            emit('update:expanded', localExpanded.value);
        };

        const isExpanded = () => localExpanded.value;

        return {
            hasChildren,
            toggle,
            isExpanded
        };
    },
    name: 'menu-item',
    emits: ['update:expanded'],
    components: { IconButton }
});
</script>
