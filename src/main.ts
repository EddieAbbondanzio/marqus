/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store/store';

const app = createApp(App);
app.use(store)
    .use(router)
    .mount('#app');
