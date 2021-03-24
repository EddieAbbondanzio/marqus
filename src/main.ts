/*eslint-disable*/
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@/assets/styles/main.sass';
import { store } from './store/store';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

const app = createApp(App);
app.use(store)
    .use(router)
    .mount('#app');

store.dispatch('startup');

// window.addEventListener('contextmenu', (e) => {
//     e.preventDefault();
//     try {
//         ipcRenderer.send('show-context-menu'); // Need to send it to main thread
//     } catch (e) {
//         console.log('FUCK');
//     }
// });
