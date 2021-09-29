<template>
    <div :class="`dropdown ${isActive ? 'is-active' : ''} is-flex-column`">
        <div class="dropdown-trigger">
            <slot name="trigger" :toggle="toggle" :focus="focus" :blur="blur"> </slot>
        </div>

        <slot name="menu">
            <DropdownMenu>
                <slot name="content" :items="items">
                    <div v-for="(item, i) in items" :key="item.id">
                        <slot name="item" :index="i" :item="item">
                            <DropdownItem :value="item" />
                        </slot>
                    </div>
                </slot>
            </DropdownMenu>
        </slot>
    </div>
</template>

<script lang="ts">
import DropdownMenu from "@/components/dropdown/DropdownMenu.vue";
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import DropdownItem from "@/components/dropdown/DropdownItem.vue";
import { climbDomForMatch } from "@/utils/dom";

export default defineComponent({
  components: { DropdownMenu, DropdownItem },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  setup(p, c) {
    const isActive = ref(p.active);

    const toggle = () => setIsActive(!isActive.value);
    const focus = () => setIsActive(true);
    const blur = () => {
      setIsActive(false);
    };

    const listenForBlur = (e: MouseEvent) => {
      if (!isActive.value) {
        return;
      }

      const isWithinMenu = climbDomForMatch(e.target as HTMLElement, (el) =>
        el.classList.contains("dropdown-menu") ||
        el.classList.contains("dropdown-trigger") ||
        el.classList.contains("dropdown-item")
      );

      // User clicked outside of dropdown menu. Hide it.
      if (!isWithinMenu) {
        setIsActive(false);
      }
    };

    onMounted(() => {
      window.addEventListener("mousedown", listenForBlur);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("mousedown", listenForBlur);
    });

    const setIsActive = (v: boolean) => {
      c.emit("update:active", v);
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
  emits: ["update:active"]
});
</script>

<style lang="sass">
// Fixes nested dropdown support in Bulma
.dropdown:not(.is-active) > .dropdown-menu
    display: none!important
</style>
