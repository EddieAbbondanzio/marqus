/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store, key } from './store/store';

const app = createApp(App);
app.use(store, key)
    .use(router)
    .mount('#app');
