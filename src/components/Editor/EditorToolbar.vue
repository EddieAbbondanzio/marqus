<template>
    <div class="has-background-light has-border-bottom-1-dark p-1 is-flex is-align-center">
        <div class="buttons has-addons mb-0 mx-1">
            <button id="editButton" class="button mb-0" style="height: 30px" title="Edit" @click="toggleMode">
                <span :class="editIconClasses" v-if="mode === 'view'">
                    <i class="fas fa-edit"></i>
                </span>
                <span :class="editIconClasses" v-else>
                    <i class="fas fa-save"></i>
                </span>
            </button>
            <button class="button mb-0" style="height: 30px" title="Delete">
                <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                </span>
            </button>
        </div>

        <div class="buttons has-addons mb-0 mx-1">
            <button class="button mb-0" title="Edit notebook links" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-book"></i>
                </span>
            </button>
            <button class="button mb-0" title="Edit tags" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-tag"></i>
                </span>
            </button>
            <button class="button mb-0" title="Add to favorites" style="height: 30px">
                <span class="icon is-small">
                    <i class="fas fa-star"></i>
                </span>
            </button>
        </div>

        {{ mode }}
    </div>
</template>

<script lang="ts">
import { store } from '@/store/store';
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
    setup: function() {
        const s = useStore(); // Need this to be able to unit test

        return {
            toggleMode: function() {
                s.commit('editor/toggleMode');
                s.dispatch('editor/save');
            }
        };
    },
    computed: {
        mode: () => (store.state.editor as any).mode,
        editIconClasses: () => ({
            'has-text-warning': store.state.editor.mode === 'view',
            'icon is-small': true
        })
    }
});
</script>
