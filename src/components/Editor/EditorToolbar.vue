<template>
    <div class="has-background-light has-border-bottom-1-dark p-1 is-flex is-align-center">
        <div class="buttons has-addons mb-0 mx-1">
            <button class="button mb-0" style="height: 30px" title="Edit">
                <span class="icon is-small">
                    <i class="fas fa-pen"></i>
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
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

export default defineComponent({});
</script>
