import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { uuid as $uuid } from 'vue-uuid';
import { useNotificationsStore } from '@/stores/notification.js';

export const useUserInputStore = defineStore(
    'user-input',
    () => {
        const shouldSaveAllImages = ref(false);

        const generationType = ref('generate');
        const prompt = ref('');
        const negativePrompt = ref('');
        const steps = ref(65);
        const cfgScale = ref(7.5);
        const upscale = ref('0.5');
        const imageCount = ref(1);
        const referenceImage = ref(null);

        const referenceImageStrength = ref(0.5);
        const promptOutputScale = ref(7.5);

        const userPresets = ref([]);
        const selectedPresetsForBulkOperation = ref({});
        const bulkOperationUpscale = ref('0.5');
        const bulkOperationImageCount = ref(1);
        const bulkOperationStartDate = ref(null);
        const currentBulkOperationPresetIndex = ref(0);

        const setShouldSaveAllImages = (value) => {
            shouldSaveAllImages.value = value;
        };

        const setGenerationType = (value) => {
            generationType.value = value;
        };

        const setPrompt = (value) => {
            prompt.value = value;
        };

        const setNegativePrompt = (value) => {
            negativePrompt.value = value;
        };

        const setSteps = (value) => {
            steps.value = value;
        };

        const setCfgScale = (value) => {
            cfgScale.value = value;
        };

        const setUpscale = (value) => {
            upscale.value = value;
        };

        const setImageCount = (value) => {
            imageCount.value = value;
        };

        const setReferenceImage = (value) => {
            referenceImage.value = value;
        };

        const setReferenceImageStrength = (value) => {
            referenceImageStrength.value = value;
        };

        const setPromptOutputScale = (value) => {
            promptOutputScale.value = value;
        };

        const createPreset = () => {
            userPresets.value.push({
                id: $uuid.v4(),
                date: Date.now(),
                name: `${Date.now()}-${prompt.value}`,
                generationType: generationType.value,
                prompt: prompt.value,
                negativePrompt: negativePrompt.value,
                steps: steps.value,
                cfgScale: cfgScale.value,
                upscale: upscale.value,
                imageCount: imageCount.value,
                referenceImageStrength: referenceImageStrength.value,
                promptOutputScale: promptOutputScale.value,
                referenceImage: referenceImage.value,
            });

            const notificationStore = useNotificationsStore();
            notificationStore.addNotification('Preset created!');
        };

        const applyPreset = (presetId) => {
            const preset = userPresets.value.find((preset) => preset.id === presetId);

            if (preset) {
                setGenerationType(preset.generationType);
                setPrompt(preset.prompt);
                setNegativePrompt(preset.negativePrompt);
                setSteps(preset.steps);
                setCfgScale(preset.cfgScale);
                setUpscale(preset.upscale);
                setImageCount(preset.imageCount);
                setReferenceImageStrength(preset.referenceImageStrength);
                setPromptOutputScale(preset.promptOutputScale);
                setReferenceImage(preset.referenceImage);
            }

            if (bulkOperationStartDate.value) {
                setUpscale(bulkOperationUpscale.value);
                setImageCount(bulkOperationImageCount.value);
            }
        };

        const removePreset = (presetId) => {
            userPresets.value = userPresets.value.filter((preset) => preset.id !== presetId);
        };

        // Bulk operations
        const setBulkOperationStartDate = (value) => {
            bulkOperationStartDate.value = value;
        };

        const setBulkOperationPresetIndex = (value) => {
            currentBulkOperationPresetIndex.value = value;
            return currentBulkOperationPresetIndex.value;
        };

        const selectedBulkPresets = computed(() =>
            userPresets.value?.filter(
                (preset) => selectedPresetsForBulkOperation.value[preset.id] === true,
            ),
        );

        return {
            shouldSaveAllImages,
            setShouldSaveAllImages,
            userPresets,
            createPreset,
            removePreset,
            applyPreset,
            generationType,
            prompt,
            negativePrompt,
            steps,
            cfgScale,
            upscale,
            imageCount,
            referenceImageStrength,
            promptOutputScale,
            referenceImage,
            setGenerationType,
            setPrompt,
            setNegativePrompt,
            setSteps,
            setCfgScale,
            setUpscale,
            setImageCount,
            setReferenceImageStrength,
            setPromptOutputScale,
            setReferenceImage,
            selectedPresetsForBulkOperation,
            bulkOperationUpscale,
            bulkOperationImageCount,
            bulkOperationStartDate,
            setBulkOperationStartDate,
            currentBulkOperationPresetIndex,
            setBulkOperationPresetIndex,
            selectedBulkPresets,
        };
    },
    {
        persist: {
            storage: localStorage,
        },
    },
);
