import { defineStore } from 'pinia';
import { ref } from 'vue';
import { sendToSocket } from '@/utils/socket.js';

export const useLoginStore = defineStore(
    'login',
    () => {
        const token = ref('');

        const setToken = (value) => {
            token.value = value;

            if (token.value) {
                sendToSocket('ping');
            }
        };

        return {
            token,
            setToken,
        };
    },
    {
        persist: {
            storage: localStorage,
        },
    },
);
