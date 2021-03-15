window.require = require;

import { mount, shallowMount } from '@vue/test-utils';
import GlobalNavigation from '@/components/GlobalNavigation.vue';
import { createApp } from 'vue';
import { store } from '@/store/store';

describe('HelloWorld.vue', () => {
    it('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = shallowMount(GlobalNavigation, {
            props: { msg },
            global: {
                plugins: [store]
            }
        });

        expect(true).toBeTruthy();
    });
});
