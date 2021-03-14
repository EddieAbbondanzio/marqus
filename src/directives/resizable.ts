import { Directive } from 'vue';

export default {
    mounted: (el: HTMLElement) => {
        const wrapper = wrapElement(el);
        const handle = createHandle();

        wrapper.appendChild(handle);

        /**
         * Wrap the directive element in a container, and return said container
         */
        function wrapElement(el: HTMLElement): HTMLElement {
            const wrapper = document.createElement('div');
            wrapper.className = 'resizable-wrapper';
            el.parentElement!.insertBefore(wrapper, el);
            el.parentElement!.removeChild(el);
            wrapper.appendChild(el);

            return wrapper;
        }

        function createHandle(): HTMLElement {
            const e = document.createElement('div');

            return e;
        }
    }
} as Directive;
