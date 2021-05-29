import IconButton from '@/core/components/IconButton.vue';
import { mount } from '@vue/test-utils';

describe('IconButton.vue', () => {
    it('sets button type', () => {
        const wrapper = mount(IconButton, {
            props: { type: 'submit' }
        });

        const button = wrapper.find('button');
        expect(button.element.type).toBe('submit');
    });

    it('emits click when clicked', () => {
        const wrapper = mount(IconButton);

        const button = wrapper.find('button');
        button.trigger('click');

        const emitted = wrapper.emitted();
        expect(emitted.click).toBeTruthy();
    });
});
