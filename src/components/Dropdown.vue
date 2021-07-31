<template>
    <div :class="`dropdown ${isActive ? 'is-active' : ''}`">
        <div class="dropdown-trigger">
            <slot name="trigger" :toggle="toggle"> </slot>
        </div>

        <slot name="menu">
            <div class="dropdown-menu">
                <div class="dropdown-content">
                    <slot name="content"> </slot>
                </div>
            </div>
        </slot>
    </div>
</template>

<script lang="ts">
import { climbDomHierarchy } from '@/shared/utils';
import { computed, defineComponent, ref, watch } from 'vue';

export default defineComponent({
    props: {
        active: {
            type: Boolean,
            default: false
        }
    },
    setup(p, c) {
        const isActive = ref(p.active);
        const toggle = (e: Event) => {
            e.stopPropagation();

            const newValue = !isActive.value;

            if (newValue) {
                window.addEventListener('click', listenForBlur);
            } else {
                window.removeEventListener('click', listenForBlur);
            }

            setIsActive(newValue);
            return newValue;
        };

        const listenForBlur = (e: MouseEvent) => {
            const isWithinMenu = climbDomHierarchy<boolean>(e.target as HTMLElement, {
                match: (el) => el.classList.contains('dropdown-menu')
            });

            // User clicked outside of dropdown menu. Hide it.
            if (!isWithinMenu) {
                setIsActive(false);
            }
        };

        const setIsActive = (v: boolean) => {
            c.emit('update:active', v);
            isActive.value = v;
        };

        watch(
            () => p.active,
            (v: boolean) => {
                isActive.value = v;
            }
        );

        return {
            isActive,
            toggle
        };
    },
    emits: ['update:active']
});
</script>

<style lang="sass">
// Fixes nested dropdown support in Bulma
.dropdown:not(.is-active) > .dropdown-menu
    display: none!important
</style>
