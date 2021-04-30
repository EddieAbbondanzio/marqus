window.require = require;

import Resizable from '@/components/core/Resizable.vue';
import { store } from '@/store';
import { mount } from '@vue/test-utils';
import { mouse } from '@/directives/mouse/mouse';

describe('Resizable.vue', () => {
    it('sets width, and minWidth on mounted', () => {
        const width = '127px';
        const minWidth = '420px';
        const wrapper = mount(Resizable, {
            props: { modelValue: width, minWidth },
            global: {
                plugins: [store],
                directives: { mouse }
            }
        });

        const element = wrapper.find('.resizable-wrapper').element as HTMLElement;

        expect(element.style.width).toBe(width);
        expect(element.style.minWidth).toBe(minWidth);
    });

    // it('updates modelValue on mousemove', async () => {
    //     const width = '127px';
    //     const wrapper = mount(Resizable, {
    //         props: { modelValue: width, minWidth: width },
    //         global: {
    //             plugins: [store],
    //             directives: { mouse }
    //         }
    //     });

    //     await wrapper.find('.resizable-handle').trigger('mousedown');
    //     document.dispatchEvent(new MouseEvent('mousemove'));

    //     expect((wrapper.props as any)['modelValue']).not.toEqual(width);
    // });

    // it('emits resizeStop on mouseup', async () => {
    //     const width = '127px';
    //     const wrapper = mount(Resizable, {
    //         props: { modelValue: width, minWidth: width },
    //         global: {
    //             plugins: [store],
    //             directives: { mouse }
    //         }
    //     });

    //     await wrapper.find('.resizable-handle').trigger('mousedown');
    //     document.dispatchEvent(new MouseEvent('mouseup'));

    //     expect(wrapper.emitted().resizeStop).toBeTruthy();
    // });
});
