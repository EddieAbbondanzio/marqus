<template>
    <div class="list-builder">
        <List>
            <ListItem v-for="item in sortedSelected" :key="item.id">
                <span class="is-size-7"><slot name="item" :item="item"></slot></span
                ><DeleteButton @click.stop="() => remove(item)" />
            </ListItem>

            <ListItem>
                <slot name="input" :add="add" :remove="remove"> </slot>
            </ListItem>
        </List>
    </div>
</template>

<script lang="ts">
import DeleteButton from "@/components/buttons/DeleteButton.vue";
import { computed, defineComponent } from "vue";
import List from "@/components/layout/List.vue";
import ListItem from "@/components/layout/ListItem.vue";
import { caseInsensitiveCompare } from "@/utils/string";

export default defineComponent({
  setup(p, c) {
    const add = (opt: any) => {
      c.emit("add", opt);
      c.emit("update:selected", [...p.selected, opt]);
    };

    const remove = (opt: any) => {
      c.emit("remove", opt);
      c.emit("update:selected", opt);
    };

    const sortedSelected = computed(() => {
      const selected = p.selected as { value: string }[];
      return selected.sort(caseInsensitiveCompare((v) => v.value));
    });

    return {
      sortedSelected,
      add,
      remove
    };
  },
  props: {
    selected: {
      type: Array,
      required: true
    }
  },
  emits: ["update:selected", "add", "remove"],
  components: { DeleteButton, List, ListItem }
});
</script>

<style lang="sass" scoped>
.list-builder
    .list-item
        span
            padding-left: 8px
</style>
