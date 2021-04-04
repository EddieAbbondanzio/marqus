window.require = require;

import Resizable from '@/components/Resizable.vue';
import { store } from '@/store/store';
import { mount } from '@vue/test-utils';

describe('Resizable.vue', () => {
    it('sets width, and minWidth on mounted', () => {
        const width = '127px';
        const minWidth = '420px';
        const wrapper = mount(Resizable, {
            props: { modelValue: width, minWidth },
            global: {
                plugins: [store]
            }
        });

        const element = wrapper.find('.resizable-wrapper').element as HTMLElement;

        expect(element.style.width).toBe(width);
        expect(element.style.minWidth).toBe(minWidth);
    });

    it('emits resizeStart on mousedown', async () => {
        const width = '127px';
        const wrapper = mount(Resizable, {
            props: { modelValue: width, minWidth: width },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find('.resizable-handle').trigger('mousedown');
        expect(wrapper.emitted().resizeStart).toBeTruthy();
    });

    it('updates modelValue on mousemove', async () => {
        const width = '127px';
        const wrapper = mount(Resizable, {
            props: { modelValue: width, minWidth: width },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find('.resizable-handle').trigger('mousedown');
        document.dispatchEvent(new MouseEvent('mousemove'));

        expect((wrapper.props as any)['modelValue']).not.toEqual(width);
    });

    it('emits resizeStop on mouseup', async () => {
        const width = '127px';
        const wrapper = mount(Resizable, {
            props: { modelValue: width, minWidth: width },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find('.resizable-handle').trigger('mousedown');
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(wrapper.emitted().resizeStop).toBeTruthy();
    });
});
