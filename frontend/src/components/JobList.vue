<template>
    <v-list lines="two">
        <span>Jobs</span>
        <v-btn
            color="error"
            size="x-small"
            class="ml-2"
            @click.prevent="generatorStore.cancelAllJobs"
        >
            Stop All
        </v-btn>

        <v-list-item v-for="job in generatorStore.currentJobs" :key="job.id" class="pl-0 pr-0">
            <v-progress-linear
                :model-value="job.completed"
                :max="job.total"
                color="primary"
                striped
            />

            <template v-slot:title>
                <span>{{ job.id }}</span>
            </template>
            <template v-slot:subtitle>
                <span
                    >{{ formatJobTime(job.startTime) }} - ({{ job.completed }}/{{
                        job.total
                    }})</span
                >
            </template>
            <template v-slot:append>
                <v-btn
                    icon="fa-solid fa-times"
                    elevation="0"
                    color="transparent"
                    @click.prevent="generatorStore.cancelJob(job.id)"
                >
                    <font-awesome-icon :icon="`fa-solid fa-times`" />
                </v-btn>
            </template>
        </v-list-item>
    </v-list>
</template>

<script setup>
import { useGeneratorStore } from '@/stores/generator.js';
import { useDate } from 'vuetify';

const date = useDate();
const generatorStore = useGeneratorStore();

const formatJobTime = (time) => date.format(new Date(time), 'keyboardDateTime24h');
</script>
