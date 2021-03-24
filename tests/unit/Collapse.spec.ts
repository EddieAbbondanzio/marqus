import Collapse from '@/components/Collapse.vue';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

describe('Collapse.vue', () => {
    it('toggles v-model on trigger click', () => {
        let modelValue = ref(false);

        const wrapper = mount(Collapse, {
            props: { modelValue }
        });

        wrapper.find('.collapse-trigger').trigger('click');

        expect(modelValue).toBeTruthy();
    });
});
