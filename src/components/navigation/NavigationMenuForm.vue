<template>
    <Form
        @submit="$emit('submit')"
        class="is-flex is-flex-column is-justify-center is-relative"
        v-slot="{ submitCount, meta }"
    >
        <div
            class="is-flex is-align-center has-background-light pr-2"
            :style="`height: 30px; padding-left: ${indent}!important`"
        >
            <Field :name="fieldName" v-model="inputValue" v-slot="{ field }" :rules="rules">
                <!-- Padding and margin is adjusted to get the text within the input to match perfectly to a menu item. -->
                <input
                    id="inputField"
                    :class="
                        `input is-flex-grow-1 is-size-7 ${
                            (meta.dirty || submitCount > 0) && !meta.valid ? 'is-danger' : ''
                        }`
                    "
                    type="text"
                    v-bind="field"
                    style="height: 21px!important; min-width: 0; width: 0; flex-grow: 1; padding: 2px 0px!important; margin-left: -2px!important; margin-top: -1px!important"
                    v-focus
                    @blur="onBlur"
                    @input="onInput"
                />
            </Field>
        </div>

        <ErrorMessage :name="fieldName" v-slot="{ message }">
            <div
                id="errorMessage"
                class="notification is-danger is-absolute  p-1 is-flex is-align-center"
                :style="`top: 30px; left: ${indent};  margin-left: -2px;`"
            >
                <span class="icon is-small">
                    <i class="fas fa-exclamation"></i>
                </span>

                <span class="is-size-7 pr-2">
                    {{ message }}
                </span>
            </div>
        </ErrorMessage>

        <!-- We need to be able to render children so we can do updates in mid level navigation items -->
        <div>
            <slot></slot>
        </div>
    </Form>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue';
import { Field, ErrorMessage, Form } from 'vee-validate';

/**
 * Inline form for creating values in nav menus that only have 1
 * field to populate.
 */
export default defineComponent({
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        indent: {
            type: String,
            default: '0px'
        },
        fieldName: {
            type: String,
            default: 'Field'
        },
        rules: {
            type: Object,
            default: () => ({})
        }
    },
    directives: {
        focus: {
            mounted(el, binding, vnode) {
                el.focus();
            }
        }
    },
    setup(p, c) {
        let isClean = true;

        const inputValue = computed({
            get: () => p.modelValue,
            set: (v) => {
                // Dont' go any further if it's the same.
                if (v !== p.modelValue) {
                    c.emit('update:modelValue', v);
                    isClean = false;
                }
            }
        });

        // When input is blurred, check to see if it was empty. If it was empty, cancel.
        const onBlur = (e: any) => {
            if (isClean) {
                c.emit('cancel');
            } else {
                c.emit('submit');
            }
        };

        const onCancel = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                c.emit('cancel');
            }
        };

        onMounted(() => {
            window.addEventListener('keyup', onCancel);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('keyup', onCancel);
        });

        return {
            inputValue,
            onBlur
        };
    },
    emits: ['submit', 'cancel', 'update:modelValue'],
    components: { Field, ErrorMessage, Form }
});
</script>
