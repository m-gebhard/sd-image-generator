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
                    <div class="pr-md-3">
                        <v-tabs
                            v-model="currentTab"
                            bg-color="transparent"
                            align-tabs="center"
                            class="mb-6"
                        >
                            <v-tab value="generator">Generator</v-tab>
                            <v-tab value="presets">Presets</v-tab>
                        </v-tabs>
                        <v-tabs-window v-model="currentTab">
                            <v-tabs-window-item value="generator">
                                <template v-if="userInputStore.bulkOperationStartDate !== null">
                                    <h4 class="text-center text-error mb-4">
                                        Bulk Operation Running
                                    </h4>
                                    <v-progress-linear indeterminate color="error" striped />
                                </template>
                                <template v-else>
                                    <v-divider class="mb-10"></v-divider>
                                    <input-form />
                                    <v-divider class="mb-3 mt-5"></v-divider>
                                    <job-list />
                                </template>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="presets">
                                <presets-panel @on-preset-apply="currentTab = 'generator'" />
                            </v-tabs-window-item>
                        </v-tabs-window>
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
import PresetsPanel from '@/components/PresetsPanel.vue';
import { useUserInputStore } from '@/stores/userInput.js';

const isSidebarOpened = ref(true);
const currentTab = ref('generator');

const userInputStore = useUserInputStore();
const favouritesStore = useFavouritesStore();
const loginStore = useLoginStore();

userInputStore.setBulkOperationStartDate(null);

if (loginStore.token) {
    favouritesStore.loadFavourites();
    favouritesStore.loadTemporaryImages();
}

const isAppReady = computed(
    () => state?.connected && !favouritesStore.isLoading && !!loginStore.token,
);
</script>
