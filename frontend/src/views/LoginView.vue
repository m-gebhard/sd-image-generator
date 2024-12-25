<template>
    <div class="login h-100">
        <v-container class="h-100">
            <v-row align="center" justify="center" class="h-100">
                <v-col cols="12" class="d-flex flex-column flex-nowrap">
                    <h3 class="text-white text-center mb-5">Enter Token</h3>
                    <v-text-field
                        class="w-100 w-md-75 w-lg-33 w-xl-25 ma-auto mb-6"
                        hide-details
                        hide-spin-buttons
                        v-model="enteredToken"
                    />
                    <v-btn
                        width="250px"
                        class="ml-auto mr-auto"
                        color="primary"
                        elevation="0"
                        @click="onContinueClick"
                    >
                        Continue
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLoginStore } from '@/stores/login.js';

const enteredToken = ref('');
const loginStore = useLoginStore();

const onContinueClick = () => {
    if (enteredToken.value) {
        loginStore.setToken(enteredToken.value);
        window.location.reload();
    }
};
</script>
