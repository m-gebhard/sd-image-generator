// Vue
import { createApp } from 'vue';
import { createPinia } from 'pinia';

//
import '@/scss/app.scss';
import App from '@/App.vue';
import router from '@/router';
import '@/utils/socket.js';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import VueEasyLightbox from 'vue-easy-lightbox';
import '@/utils/imagesDatabase.js';

// FA
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faTimes,
    faStar as solidStar,
    faCaretDown,
    faCaretUp,
    faCopy,
    faComment,
    faSpinner,
    faCheckSquare,
    faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faStar, faSquare } from '@fortawesome/free-regular-svg-icons';

library.add(
    faTimes,
    faStar,
    solidStar,
    faCaretDown,
    faCaretUp,
    faCopy,
    faComment,
    faSpinner,
    faSquare,
    faCheckSquare,
    faTrash,
);

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, fa } from 'vuetify/iconsets/fa-svg';

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'dark',
    },
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        },
    },
});

// Initialize vue stuff
const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(VueEasyLightbox);
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
