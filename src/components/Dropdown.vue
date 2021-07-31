<template>
    <div :class="`dropdown ${isActive ? 'is-active' : ''}`">
        <div class="dropdown-trigger">
            <slot name="trigger" :toggle="toggle" :focus="focus" :blur="blur"> </slot>
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
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';

export default defineComponent({
    props: {
        active: {
            type: Boolean,
            default: false
        }
    },
    setup(p, c) {
        const isActive = ref(p.active);

        const toggle = (e: Event) => setIsActive(!isActive.value);
        const focus = (e: Event) => setIsActive(true);
        const blur = (e: Event) => setIsActive(false);

        const listenForBlur = (e: MouseEvent) => {
            console.log('val: ', isActive.value);
            if (!isActive.value) {
                return;
            }

            const isWithinMenu = climbDomHierarchy<boolean>(e.target as HTMLElement, {
                match: (el) => el.classList.contains('dropdown-menu') || el.classList.contains('dropdown-trigger')
            });

            // User clicked outside of dropdown menu. Hide it.
            if (!isWithinMenu) {
                setIsActive(false);
                console.log('hide it!');
            }
        };

        onMounted(() => {
            window.addEventListener('click', listenForBlur);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('click', listenForBlur);
        });

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
            toggle,
            focus,
            blur
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
