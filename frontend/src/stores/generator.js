import { ref } from 'vue';
import { defineStore } from 'pinia';
import { sendToSocket } from '@/utils/socket.js';
import { GENERATION_TYPES } from '@/utils/constants.js';
import { uuid as $uuid } from 'vue-uuid';
import { useUserInputStore } from '@/stores/userInput.js';

export const useGeneratorStore = defineStore('generator', () => {
    const generatedImages = ref([]);
    const currentJobs = ref([]);
    const finishedJobs = ref([]);

    const inputStore = useUserInputStore();

    // Jobs
    const addJob = (job) =>
        currentJobs.value.push({
            id: job,
            completed: 0,
            total: 0,
            startTime: Date.now(),
        });
    const removeJob = (jobId) =>
        currentJobs.value.splice(
            currentJobs.value.findIndex((job) => job.id === jobId),
            1,
        );

    const addFinishedJob = (jobId) => finishedJobs.value.push({ id: jobId, endTime: Date.now() });
    const cancelJob = async (jobId) => {
        await sendToSocket('cancel', { job_id: jobId });
        removeJob(jobId);
    };
    const cancelAllJobs = async () => {
        await sendToSocket('cancel_all');

        currentJobs.value.forEach((job) => addFinishedJob(job.id));
        currentJobs.value = currentJobs.value.splice(0, currentJobs.value.length);
    };
    const updateJobProgress = (jobId, completed, total) => {
        const job = currentJobs.value.find((job) => job.id === jobId);

        if (job) {
            job.completed = completed;
            job.total = total;
        }
    };

    // Generated Images
    const addGeneratedImage = (image, jobId, meta) =>
        generatedImages.value.push({
            id: $uuid.v4(),
            jobId: jobId,
            base64: image,
            meta: {
                ...meta,
                date: Date.now(),
            },
        });
    const removeGeneratedImage = (imageId) =>
        generatedImages.value.splice(
            generatedImages.value.findIndex((image) => image.id === imageId),
            1,
        );

    // User actions
    const queueImageJob = async (data = null, generationType = GENERATION_TYPES.PROMPT) => {
        if (data && generationType) {
            sendToSocket(generationType, data);
        } else {
            if (
                inputStore.generationType === GENERATION_TYPES.REFERENCE_IMAGE &&
                !inputStore.referenceImage
            ) {
                inputStore.generationType = GENERATION_TYPES.PROMPT;
            }

            sendToSocket(inputStore.generationType, {
                prompt: inputStore.prompt,
                negative_prompt: inputStore.negativePrompt,
                reference_image: inputStore.referenceImage,
                steps: parseFloat(inputStore.steps),
                cfg_scale: parseFloat(inputStore.cfgScale),
                upscale: parseFloat(inputStore.upscale),
                image_count: parseInt(inputStore.imageCount),
                prompt_output_scale: parseFloat(inputStore.promptOutputScale),
                reference_image_strength: parseFloat(inputStore.referenceImageStrength),
            });
        }
    };

    return {
        generatedImages,
        currentJobs,
        finishedJobs,
        queueImageJob,
        addJob,
        addFinishedJob,
        cancelJob,
        cancelAllJobs,
        removeJob,
        updateJobProgress,
        addGeneratedImage,
        removeGeneratedImage,
    };
});
