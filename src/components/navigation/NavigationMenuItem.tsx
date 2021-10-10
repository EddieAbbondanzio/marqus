<template>
    <div ref="wrapper">
        <a
            :class="{
                'pr-2': true,
                'is-block': true,
                'has-background-hover-light': true,
                'no-drag': true,
                'has-background-light': active || highlight
            }"
            @click="onClick"
            v-context
        >
            <div
                class=" has-text-grey is-flex is-justify-content-space-between is-align-center"
                style="height: 30px!important;"
            >
                <div class="is-flex is-align-center" :style="`padding-left: ${indent}!important; min-width: 0px;`">
                    <span class="icon" v-if="icon">
                        <i :class="`fas fa-${icon}`"></i>
                    </span>
                    <!-- Spacer to fill empty icon spot -->
                    <span style="width: 24px!important" v-else-if="!hideIcon">
                        &nbsp;
                    </span>

                    <slot name="label">
                        <span class="navigation-menu-item-label is-size-7">{{ label }}</span>
                    </slot>
                </div>

                <div class="is-flex is-align-center">
                    <slot name="options"> </slot>

                    <!-- Expand / Collapse button -->
                    <slot name="trigger" :toggle="toggle" v-if="hasChildren & !hideToggle">
                        <!-- Stops on mouse events is needed to prevent v-mouse from breaking. -->
                        <div class="is-flex" @mouseup.stop @mousedown.stop>
                            <icon-button
                                class="has-text-grey"
                                icon="fa-angle-down"
                                size="is-size-7"
                                v-if="isExpanded()"
                                @click.stop.prevent="toggle()"
                            />
                            <icon-button
                                class="has-text-grey"
                                size="is-size-7"
                                icon="fa-angle-up"
                                v-else
                                @click.stop.prevent="toggle()"
                            />
                        </div>
                    </slot>
                    <!-- Spacer to keep options lined up even if no collapse trigger visible -->
                    <span style="width: 16px!important" v-else-if="!hideToggle">
                        &nbsp;
                    </span>
                </div>
            </div>
        </a>

        <!-- Children -->
        <div v-if="isExpanded() && hasChildren">
            <slot> </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, Ref, ref, watch } from "vue";
import IconButton from "@/components/buttons/IconButton.vue";
import { findParent, isElementAboveScroll, isElementBelowScroll } from "@/utils";

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
    highlight: {
      type: Boolean,
      default: false
    },
    /**
         * Icon to display to the left of the label.
         */
    icon: {
      type: String,
      default: ""
    },
    /**
         * Text label to describe the item
         */
    label: {
      type: String,
      default: ""
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
      default: "0px"
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
    },
    /**
         * If the item should be expanded / collapsed from anywhere by clicking it.
         */
    toggleAnywhere: {
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
      emit("update:expanded", localExpanded.value);
    };

    const isExpanded = () => localExpanded.value;

    const wrapper = ref(null!) as Ref<HTMLDivElement>;

    const releaseWatchExpanded = watch(
      () => p.expanded,
      () => {
        localExpanded.value = p.expanded;
      }
    );

    const releaseWatchHighlight = watch(
      () => p.highlight,
      (newVal) => {
        /*
                 * Try to see if we are in a scrollable, and need to scroll the item into focus.
                 */
        if (newVal) {
          const scrollable = findParent(wrapper.value, el => el.classList.contains("scrollable-wrapper"),
            { matchValue: el => el }
          );

          if (scrollable == null) {
            return;
          }

          if (isElementAboveScroll(scrollable, wrapper.value)) {
            wrapper.value.scrollIntoView();
          } else if (isElementBelowScroll(scrollable, wrapper.value)) {
            wrapper.value.scrollIntoView(false);
          }
        }
      }
    );

    const onClick = () => {
      if (p.toggleAnywhere) {
        toggle();
      }
    };

    onBeforeUnmount(() => {
      releaseWatchExpanded();
      releaseWatchHighlight();
    });

    return {
      hasChildren,
      toggle,
      isExpanded,
      onClick,
      wrapper
    };
  },
  name: "menu-item",
  emits: ["update:expanded"],
  components: { IconButton }
});
</script>

<style lang="sass" scoped>
.navigation-menu-item-label
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
</style>
