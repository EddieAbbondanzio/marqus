<template>
    <div>
        <a
            :class="{
                'px-2': true,
                'is-block': true,
                'has-background-hover-light': true,
                'has-background-light': active
            }"
        >
            <div
                class=" has-text-grey is-flex is-justify-content-space-between is-align-center has-background-transparent"
                style="height: 30px!important;"
            >
                <div
                    class="is-flex is-align-center has-background-transparent"
                    :style="`padding-left: ${indent}!important;`"
                >
                    <span class="icon" v-if="icon">
                        <i :class="`fas fa-${icon}`"></i>
                    </span>
                    <!-- Spacer to fill empty icon spot -->
                    <span style="width: 24px!important" v-else-if="!hideIcon">
                        &nbsp;
                    </span>

                    <slot name="label">
                        <p class="is-size-7">{{ label }}</p>
                    </slot>
                </div>

                <!-- Expand / Collapse button -->
                <slot name="trigger" :toggle="toggle" v-if="hasChildren & !hideToggle">
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
        <div class="has-background-transparent" v-if="isExpanded() && hasChildren">
            <slot> </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, reactive, ref, watch } from 'vue';
import IconButton from '@/components/core/IconButton.vue';

export default defineComponent({
    props: {
        /**
         * If the background color of the item should be shaded to indicate
         * this is the active menu option
         */
        active: {
            type: Boolean,
            default: false
        },
        /**
         * Icon to display to the left of the label.
         */
        icon: {
            type: String,
            default: ''
        },
        /**
         * Text label to describe the item
         */
        label: {
            type: String,
            default: ''
        },
        /**
         * If the items children are expanded, and visible.
         */
        expanded: {
            type: Boolean,
            default: false
        },
        /**
         * Indentation to the left of the icon / label. Used to indicate
         * level of depth in menu heirarchy.
         */
        indent: {
            type: String,
            default: '0px'
        },
        /**
         * Hide the icon (or spacer) on the nav item so the label doesn't
         * have a huge gap to the left of it.
         */
        hideIcon: {
            type: Boolean,
            default: false
        },
        /**
         * If the expand / collapse trigger should be hidden.
         */
        hideToggle: {
            type: Boolean,
            default: false
        }
    },
    setup(p, { slots, emit }) {
        /*
         * Expanded prop is optional, so we need to create a local variable
         * to store state in, in case no prop was passed.
         */
        const localExpanded = ref(p.expanded);
        const hasChildren = computed(() => !!slots.default);

        const toggle = () => {
            localExpanded.value = !localExpanded.value;
            emit('update:expanded', localExpanded.value);
        };

        const isExpanded = () => localExpanded.value;

        const watchRelease = watch(
            () => p.expanded,
            () => {
                localExpanded.value = p.expanded;
            }
        );

        onBeforeUnmount(() => {
            watchRelease();
        });

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
