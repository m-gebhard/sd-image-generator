<template>
    <v-form ref="form" class="input-form" @submit.prevent="onSubmit">
        <v-row>
            <v-col cols="12">
                <v-textarea
                    v-model="inputStore.prompt"
                    label="Prompt"
                    required
                    :rules="[(v) => !!v || 'Prompt is required']"
                    :counter="250"
                    color="primary"
                />

                <v-textarea
                    v-model="inputStore.negativePrompt"
                    label="Negative Prompt"
                    required
                    :counter="250"
                    rows="3"
                />

                <v-select
                    v-model="inputStore.generationType"
                    :items="[
                        { mode: 'Prompt', value: 'generate' },
                        { mode: 'Reference Image', value: 'generate_from_reference' },
                    ]"
                    label="Mode"
                    item-title="mode"
                    item-value="value"
                    required
                />

                <v-divider class="mb-6" />

                <v-slider v-model="inputStore.steps" step="1" :min="20" :max="100" label="Steps">
                    <template v-slot:append>
                        <span>{{ inputStore.steps }}</span>
                    </template>
                </v-slider>

                <v-slider
                    v-model="inputStore.cfgScale"
                    step="0.5"
                    :min="5"
                    :max="30"
                    label="CFG Scale"
                >
                    <template v-slot:append>
                        <span>{{ inputStore.cfgScale?.toFixed(1) }}</span>
                    </template>
                </v-slider>

                <v-select
                    v-model="inputStore.upscale"
                    :items="[
                        { label: '128x128', value: '0.125' },
                        { label: '256x256', value: '0.25' },
                        { label: '512x512', value: '0.5' },
                        { label: '768x768', value: '0.75' },
                        { label: '1024x1024', value: '1' },
                        { label: '1536x1536', value: '1.5' },
                        { label: '2048x2048', value: '2' },
                        { label: '3072x3072', value: '3' },
                        { label: '4096x4096', value: '4' },
                    ]"
                    label="Resolution"
                    item-title="label"
                    item-value="value"
                    required
                />

                <v-slider
                    v-model="inputStore.referenceImageStrength"
                    :disabled="inputStore.generationType !== 'generate_from_reference'"
                    :step="0.1"
                    :min="0"
                    :max="1"
                    label="Ref. Strength"
                >
                    <template v-slot:append>
                        <span>{{ inputStore.referenceImageStrength?.toFixed(1) }}</span>
                    </template>
                </v-slider>

                <v-slider
                    v-model="inputStore.promptOutputScale"
                    :disabled="inputStore.generationType !== 'generate_from_reference'"
                    step="0.5"
                    :min="0"
                    :max="20"
                    label="Output Scale"
                >
                    <template v-slot:append>
                        <span>{{ inputStore.promptOutputScale?.toFixed(1) }}</span>
                    </template>
                </v-slider>

                <v-row>
                    <v-col cols="6">
                        <v-text-field
                            v-model="inputStore.imageCount"
                            type="number"
                            label="Image count"
                            min="0"
                            max="9999"
                            required
                            class="mb-6"
                            hide-details
                        />
                    </v-col>
                </v-row>

                <v-divider />
            </v-col>

            <v-col cols="12" v-if="inputStore.generationType === 'generate_from_reference'">
                <span>Reference image:</span>
                <v-btn
                    v-if="inputStore.referenceImage"
                    color="error"
                    size="x-small"
                    class="ml-2"
                    @click.prevent="inputStore.setReferenceImage('')"
                >
                    Clear
                </v-btn>
                <template v-else>
                    <strong class="text-error ml-2">Image missing</strong>
                    <p class="mt-2 text-grey">
                        Click the copy icon (
                        <font-awesome-icon :icon="`fa-solid fa-copy`" />
                        ) on any image to use it as reference.
                    </p>
                </template>
                <v-img
                    v-if="inputStore.referenceImage"
                    :src="inputStore.referenceImage"
                    rounded
                    class="mt-2"
                />
                <v-divider class="mt-4" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-btn
                    type="submit"
                    color="primary"
                    width="100%"
                    :disabled="
                        inputStore.generationType === 'generate_from_reference' &&
                        !inputStore.referenceImage
                    "
                    >Generate
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script setup>
import { useGeneratorStore } from '@/stores/generator.js';
import { useUserInputStore } from '@/stores/userInput.js';
import { computed, ref } from 'vue';

const generatorStore = useGeneratorStore();
const inputStore = useUserInputStore();
const form = ref(null);
const selectedPreset = ref(null);

const onSubmit = async () => {
    const { valid } = await form._value.validate();
    const isRefImageValid =
        inputStore.generationType !== 'generate_from_reference' || !!inputStore.referenceImage;

    if (!valid || !isRefImageValid) return;

    await generatorStore.queueImageJob();
};
</script>
