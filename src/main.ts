import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/assets/styles/main.sass';
import resizable from './directives/resizable';

const app = createApp(App);

app.directive('resizable', resizable);

app.use(store)
    .use(router)
    .mount('#app');
