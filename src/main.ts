/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store/store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import contextMenu from 'electron-context-menu';
import { defineRule } from 'vee-validate';
import AllRules from '@vee-validate/rules';

Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
});

const app = createApp(App);
app.use(store)
    .use(router)
    .mount('#app');

store.dispatch('startup');

app.directive('focus', {
    mounted(el, binding, vnode) {
        el.focus();
    }
});
