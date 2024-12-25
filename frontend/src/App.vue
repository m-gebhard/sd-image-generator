<template>
    <v-responsive class="rounded">
        <v-app>
            <template v-if="loginStore.token">
                <v-bottom-navigation :active="isAppReady" :disabled="!isAppReady" color="primary">
                    <v-btn @click="isSidebarOpened = !isSidebarOpened">
                        <span>Toggle Sidebar</span>
                    </v-btn>
                    <v-btn :to="{ name: 'home' }">
                        <span>Generate</span>
                    </v-btn>
                    <v-btn :to="{ name: 'favourites' }">
                        <span>Favourites</span>
                    </v-btn>
                </v-bottom-navigation>

                <v-navigation-drawer
                    v-if="isAppReady"
                    v-model="isSidebarOpened"
                    border
                    class="pa-5"
                    :width="370"
                >
                    <div class="pr-3">
                        <v-list-item title="Image Generator"></v-list-item>
                        <v-divider class="mb-10"></v-divider>
                        <input-form />
                        <v-divider class="mb-3 mt-5"></v-divider>
                        <job-list />
                    </div>
                </v-navigation-drawer>

                <v-main class="pt-3">
                    <v-container fluid class="position-relative pb-8 h-100">
                        <v-row :class="{ 'h-100': !isAppReady }">
                            <v-col cols="12">
                                <transition-group name="list">
                                    <template v-if="isAppReady">
                                        <router-view />
                                    </template>
                                    <template v-else>
                                        <loading-overlay />
                                    </template>
                                </transition-group>

                                <lightbox />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-main>
            </template>
            <LoginView v-else />
        </v-app>
    </v-responsive>

    <notification-container />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { state } from '@/utils/socket';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import InputForm from '@/components/InputForm.vue';
import JobList from '@/components/JobList.vue';
import { computed, ref } from 'vue';
import { useFavouritesStore } from '@/stores/favourites.js';
import Lightbox from '@/components/Lightbox.vue';
import NotificationContainer from '@/components/NotificationContainer.vue';
import { useLoginStore } from '@/stores/login.js';
import LoginView from '@/views/LoginView.vue';

const isSidebarOpened = ref(true);

const favouritesStore = useFavouritesStore();
const loginStore = useLoginStore();

if (loginStore.token) {
    favouritesStore.loadFavourites();
}

const isAppReady = computed(
    () => state?.connected && !favouritesStore.isLoading && !!loginStore.token,
);
</script>
