import { mount } from '@vue/test-utils';
import TagInput from '@/common/components/form/TagInput.vue';

describe('TagInput.vue', () => {
    it('sets icon', () => {
        const wrapper = mount(TagInput, {
            props: {
                icon: 'fa-tag'
            }
        });

        const icon = wrapper.find('span.icon');
        expect(icon.exists()).toBeTruthy();
    });

    it('sets placeholder', () => {
        const wrapper = mount(TagInput, {
            props: {
                placeholder: 'foobar'
            }
        });

        const input = wrapper.find('#tag-input');
        expect(input.exists());
        expect((input.element as HTMLInputElement).placeholder).toBe('foobar');
    });

    it('populates dropdown with values', () => {
        const wrapper = mount(TagInput, {
            props: {
                values: [
                    { id: '1', value: 'foo' },
                    { id: '2', value: 'bar' },
                    { id: '3', value: 'baz' }
                ],
                active: true
            }
        });

        const items = wrapper.findAll('.dropdown-content a');
        expect(items.length).toBe(3);

        expect(items[0].element.innerHTML).toBe('foo');
        expect(items[1].element.innerHTML).toBe('bar');
        expect(items[2].element.innerHTML).toBe('baz');
    });

    it('removes selected values from available', () => {
        const wrapper = mount(TagInput, {
            props: {
                values: [
                    { id: '1', value: 'foo' },
                    { id: '2', value: 'bar' },
                    { id: '3', value: 'baz' }
                ],
                selected: [{ id: '2', value: 'bar' }],
                active: true
            }
        });

        const items = wrapper.findAll('.dropdown-content a');
        expect(items.length).toBe(2);
        expect(items[0].element.innerHTML).toBe('foo');
        expect(items[1].element.innerHTML).toBe('baz');
    });
});
