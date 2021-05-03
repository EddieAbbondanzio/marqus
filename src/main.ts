/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import contextMenu from 'electron-context-menu';
import { configure, defineRule } from 'vee-validate';
import AllRules from '@vee-validate/rules';
import { mouse } from './directives/mouse/mouse';
import { focus } from './directives/focus';
import { localize } from '@vee-validate/i18n';

Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
});

defineRule('unique', (value: any, [values, identifier, uniqueValue]: [any[], (v: any) => any, (v: any) => any]) => {
    if (value == null) {
        return true;
    }

    const match = values.find((v) => value === uniqueValue(v));

    if (match != null && identifier(value) !== identifier(match)) {
        return false;
    }

    return true;
});

configure({
    generateMessage: localize('en', {
        messages: {
            required: '{field} is required',
            unique: '{field} already exists'
        }
    })
});

const app = createApp(App);

app.use(store)
    .use(router)
    .mount('#app');

app.directive('focus', focus);
app.directive('mouse', mouse);
