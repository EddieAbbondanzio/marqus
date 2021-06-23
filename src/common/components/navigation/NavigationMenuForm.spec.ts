import NavigationMenuForm from '@/common/components/navigation/NavigationMenuForm.vue';
import { mount } from '@vue/test-utils';
import AllRules from '@vee-validate/rules';
import { configure, defineRule } from 'vee-validate';
import { unique } from '@/plugins/vee-validate/rules/unique';
import { localize } from '@vee-validate/i18n';

describe('NavigationMenuForm.vue', () => {
    Object.keys(AllRules).forEach((rule) => {
        defineRule(rule, AllRules[rule]);
    });

    defineRule('unique', unique);

    configure({
        generateMessage: localize('en', {
            messages: {
                required: '{field} is required',
                unique: '{field} already exists'
            }
        }),
        validateOnInput: true
    });

    it('emits cancel when cancelled button clicked', () => {
        const modelValue = 'cat';
        const wrapper = mount(NavigationMenuForm, {
            props: {
                modelValue
            },
            global: {
                directives: {
                    focus: jest.fn()
                }
            }
        });

        const cancelButton = wrapper.find('#cancelButton');
        cancelButton.trigger('click');

        const emitted = wrapper.emitted();
        expect(emitted.cancel).toBeTruthy();
    });

    it('auto cancels when no input, and user blurs', () => {
        const modelValue = '';
        const wrapper = mount(NavigationMenuForm, {
            props: {
                modelValue
            },
            global: {
                directives: {
                    focus: jest.fn()
                }
            }
        });

        const inputField = wrapper.find('#inputField');
        inputField.trigger('focus');
        inputField.trigger('blur');

        const emitted = wrapper.emitted();
        expect(emitted.cancel).toBeTruthy();
    });

    it('emits update:modelValue on input', () => {
        const wrapper = mount(NavigationMenuForm, {
            props: {
                modelValue: ''
            },
            global: {
                directives: {
                    focus: jest.fn()
                }
            }
        });

        const inputField = wrapper.find('#inputField');
        inputField.trigger('focus');

        (inputField.element as HTMLInputElement).value = 'cat';
        inputField.trigger('input');

        inputField.trigger('blur');

        const emitted = wrapper.emitted();
        expect(emitted['update:modelValue']).toBeTruthy();
        expect(wrapper.props().modelValue).toBe('cat');
    });

    it('cancels when escape is pressed', () => {
        const wrapper = mount(NavigationMenuForm, {
            props: {
                modelValue: 'cat'
            },
            global: {
                directives: {
                    focus: jest.fn()
                }
            }
        });

        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));

        expect(wrapper.emitted().cancel).toBeTruthy();
    });
});
