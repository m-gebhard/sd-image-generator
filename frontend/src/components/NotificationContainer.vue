<template>
    <v-row class="notification-container">
        <v-col cols="12">
            <transition-group name="list">
                <li
                    v-for="notify in notificationStore.notifications.slice().reverse()"
                    :key="notify.id"
                >
                    <v-alert
                        border="start"
                        :border-color="color(notify.type)"
                        elevation="2"
                        variant="flat"
                        @click="notificationStore.removeNotification(notify.id)"
                    >
                        <span>{{ formatTime(notify.time) }}</span>
                        <p :class="`text-${color(notify.type)}`">{{ notify.text }}</p>
                    </v-alert>
                </li>
            </transition-group>
        </v-col>
    </v-row>
</template>

<script setup>
import { useNotificationsStore } from '@/stores/notification.js';
import { useDate } from 'vuetify';

const date = useDate();
const notificationStore = useNotificationsStore();
const formatTime = (time) => date.format(new Date(time), 'keyboardDateTime24h');
const color = (type = 'primary') => (type === 'error' ? 'red' : 'primary');
</script>
