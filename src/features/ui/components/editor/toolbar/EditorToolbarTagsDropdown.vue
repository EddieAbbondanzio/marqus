<template>
    <Dropdown v-model:active="active">
        <template #trigger="{toggle}">
            <button
                @click="
                    (e) => {
                        toggle(e);
                        onToggle();
                    }
                "
                class="button mb-0 has-text-hover-grey"
                title="Tags"
                style="height: 30px"
            >
                <span class="icon is-small">
                    <i class="fas fa-tag"></i>
                </span>
            </button>
        </template>

        <template #menu>
            <div class="dropdown-menu p-0">
                <div class="dropdown-content p-0">
                    <TagInput
                        :values="tags"
                        :selected="tagsForNote(note)"
                        @update:selected="onTagInput"
                        ref="tagInput"
                        placeholder="Type to add tag"
                    />
                </div>
            </div>
        </template>
    </Dropdown>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import _ from 'lodash';
import Dropdown from '@/components/Dropdown.vue';
import TagInput from '@/components/form/TagInput.vue';
import { mapGetters, mapState, useStore } from 'vuex';
import { Note } from '@/features/notes/common/note';
import { Tag } from '@/features/tags/common/tag';
import { Tab } from '@/features/ui/store/modules/editor/state';

export default defineComponent({
    setup: function() {
        const s = useStore(); // Need this to be able to unit test

        const onTagInput = (newTags: Tag[]) => {
            const note: Note = s.getters['ui/editor/activeNote'];
            const oldTags: Tag[] = s.getters['tags/tagsForNote'](note);

            const delta = oldTags.length - newTags.length;
            let tag: Tag;

            switch (delta) {
                case 1:
                    tag = _.differenceWith(oldTags, newTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                    s.commit('notes/REMOVE_TAG', { noteId: note.id, tagId: tag.id });
                    break;

                case -1:
                    tag = _.differenceWith(newTags, oldTags, (a: Tag, b: Tag) => a.id === b.id)[0];
                    s.commit('notes/ADD_TAG', { noteId: note.id, tagId: tag.id });
                    break;
            }
        };

        const active = computed({
            get: () => {
                const tab: Tab = s.getters['ui/editor/activeTab'] as Tab;
                return tab?.tagDropdownActive ?? false;
            },
            set: (v: boolean) => {
                const tab: Tab = s.getters['ui/editor/activeTab'] as Tab;
                s.commit('ui/editor/TAG_DROPDOWN_ACTIVE', { id: tab.id, active: v });
            }
        });

        const tagInput = ref(null) as any;

        const onToggle = () => {
            tagInput.value.focus();
        };

        return {
            active,
            onTagInput,
            onToggle,
            tagInput
        };
    },
    computed: {
        ...mapState('tags', {
            tags: 'values'
        }),
        // ...mapGetters('ui/editor', {
        // note: 'activeNote'
        // }),
        ...mapGetters('tags', ['tagsForNote'])
    },
    components: {
        Dropdown,
        TagInput
    }
});
</script>
