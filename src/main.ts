/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';
import { mouse } from './directives/mouse/mouse';
import { focus } from './directives/focus';
import '@/plugins/vee-validate';

const app = createApp(App);

app.use(store)
    .use(router)
    .mount('#app');

app.directive('focus', focus);
app.directive('mouse', mouse);
