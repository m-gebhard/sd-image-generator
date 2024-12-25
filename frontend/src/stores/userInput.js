import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserInputStore = defineStore(
    'user-input',
    () => {
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
                id: Date.now(),
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
        };

        const removePreset = (presetId) => {
            userPresets.value = userPresets.value.filter((preset) => preset.id !== presetId);
        };

        return {
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
        };
    },
    {
        persist: {
            storage: localStorage,
        },
    },
);
