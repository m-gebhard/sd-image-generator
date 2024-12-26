<template>
    <image-job-grid :groups="groupedImages" />
</template>

<script setup>
import { useGeneratorStore } from '@/stores/generator.js';
import ImageJobGrid from '@/components/ImageJobGrid.vue';
import { computed } from 'vue';

const generatorStore = useGeneratorStore();

const groupedImages = computed(() => {
    const allJobs = [...generatorStore.currentJobs, ...generatorStore.finishedJobs];
    const uniqueJobs = Array.from(new Map(allJobs.map((job) => [job.id, job])).values());

    uniqueJobs.sort((a, b) => {
        if (b.startTime !== a.startTime) {
            return b.startTime - a.startTime;
        }
        return b.endTime - a.endTime;
    });

    return uniqueJobs.map((job) => ({
        jobId: job.id,
        images: generatorStore.generatedImages.filter((i) => i.jobId === job.id),
    }));
});
</script>
