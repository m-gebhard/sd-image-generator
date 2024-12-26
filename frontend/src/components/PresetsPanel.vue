<template>
    <div class="presets-panel">
        <v-row>
            <v-col>
                <v-btn
                    block
                    size="small"
                    color="primary"
                    class="mb-3"
                    title="Create a new preset from the active generator config"
                    @click="userInputStore.createPreset"
                >
                    New Preset from active Config
                </v-btn>
            </v-col>
        </v-row>
        <v-divider />
        <v-row class="py-3">
            <v-col cols="12" class="d-flex flex-row pb-0">
                <v-list-item-title>Bulk operation:</v-list-item-title>
                <template v-if="userInputStore.selectedBulkPresets.length === 0">
                    <v-row>
                        <v-col cols="12" class="d-flex flex-column">
                            <strong class="text-error ml-2">Select preset(s)</strong>
                        </v-col>
                    </v-row>
                </template>
                <template v-else>
                    <span class="ml-2"
                        ><strong class="text-primary">{{
                            userInputStore.selectedBulkPresets.length
                        }}</strong>
                        Preset(s) selected</span
                    >
                </template>
            </v-col>
            <v-col cols="12" class="pt-0">
                <p class="mt-2 text-grey">
                    Selected presets will be queued in infinite bulk-generation operation.
                </p>
            </v-col>
            <v-col cols="12" v-if="userInputStore.bulkOperationStartDate">
                <v-progress-linear indeterminate color="error" striped />
            </v-col>
            <v-col cols="12" v-if="userInputStore.selectedBulkPresets.length > 0">
                <v-select
                    v-model="userInputStore.bulkOperationUpscale"
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
                    label="Resolution Override"
                    item-title="label"
                    item-value="value"
                    required
                    class="mb-0"
                />

                <v-text-field
                    v-model="userInputStore.bulkOperationImageCount"
                    type="number"
                    label="Image count Override"
                    min="0"
                    max="9999"
                    required
                    class="mb-1"
                    hide-details
                />

                <v-btn
                    v-if="!userInputStore.bulkOperationStartDate"
                    color="primary"
                    class="mt-6"
                    block
                    @click="onStartBulkOperationClick"
                >
                    Start Bulk Operation
                </v-btn>
                <template v-else>
                    <v-btn
                        color="error"
                        class="mt-6"
                        block
                        @click.prevent="onCancelBulkOperationClick"
                    >
                        Cancel Bulk Operation
                    </v-btn>

                    <span class="mt-4 text-caption text-grey d-block"
                        >Running since {{ formatTime(userInputStore.bulkOperationStartDate) }}</span
                    >
                </template>
            </v-col>
        </v-row>

        <v-divider class="mb-2" />

        <v-list :disabled="userInputStore.bulkOperationStartDate !== null">
            <v-list-item
                v-for="preset in sortedPresets"
                elevation="0"
                class="pl-2 pr-2 mb-3 border-thin"
                base-color="grey"
            >
                <v-list-item-title
                    class="text-primary font-weight-bold py-1"
                    :title="`${preset.generationType} (${preset.date ? formatTime(preset.date) : ''})`"
                >
                    {{ preset.generationType }}
                    <span v-if="preset.date">({{ formatTime(preset.date) }})</span>
                </v-list-item-title>
                <v-list-item-media class="whitespace-wrap">
                    <p class="text-grey text-body-1 mb-2">{{ preset.prompt }}</p>

                    <p class="text-error text-body-2">{{ preset.negativePrompt }}</p>

                    <v-divider class="mt-2" />

                    <table class="w-100 text-left mt-2">
                        <tbody>
                            <tr>
                                <td>Steps</td>
                                <td colspan="2">{{ preset.steps }}</td>
                            </tr>
                            <tr>
                                <td>CFG</td>
                                <td colspan="2">{{ preset.cfgScale }}</td>
                            </tr>
                            <tr>
                                <td>Resolution</td>
                                <td colspan="2">
                                    {{ preset.upscale * 1024 }}x{{ preset.upscale * 1024 }}
                                </td>
                            </tr>
                            <tr>
                                <td>Image Count</td>
                                <td colspan="2">{{ preset.imageCount }}</td>
                            </tr>
                            <template v-if="preset.generationType === 'generate_from_reference'">
                                <tr>
                                    <td>Reference Strength</td>
                                    <td colspan="2">{{ preset.referenceImageStrength }}</td>
                                </tr>
                                <tr>
                                    <td>Output Scale</td>
                                    <td colspan="2">{{ preset.promptOutputScale }}</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>

                    <v-divider class="mt-2 mb-1" />
                </v-list-item-media>
                <v-list-item-action class="py-2">
                    <v-checkbox-btn
                        v-model="userInputStore.selectedPresetsForBulkOperation[preset.id]"
                        color="primary"
                        label="Bulk"
                        title="Use for bulk generation"
                    />
                    <v-btn
                        size="small"
                        color="primary"
                        icon=""
                        title="Apply Preset"
                        elevation="0"
                        class="mr-2"
                        @click.stop="() => onApplyPresetClick(preset.id)"
                    >
                        <font-awesome-icon icon="fa-solid fa-copy" />
                    </v-btn>
                    <v-btn
                        size="small"
                        color="error"
                        icon=""
                        title="Delete Preset"
                        elevation="0"
                        @click.stop="() => onDeletePresetClick(preset.id)"
                    >
                        <font-awesome-icon icon="fa-solid fa-trash" />
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup>
import { useUserInputStore } from '@/stores/userInput.js';
import { computed } from 'vue';
import { useDate } from 'vuetify';
import { useGeneratorStore } from '@/stores/generator.js';

const date = useDate();
const userInputStore = useUserInputStore();
const generatorStore = useGeneratorStore();

const emit = defineEmits(['onPresetApply']);

const sortedPresets = computed(() =>
    userInputStore.userPresets.sort((a, b) => (b.date || b.id) - (a.date || a.id)),
);

const formatTime = (time) => date.format(new Date(time), 'keyboardDateTime24h');

const onApplyPresetClick = (presetId) => {
    userInputStore.applyPreset(presetId);

    emit('onPresetApply');
};

const onDeletePresetClick = (presetId) => {
    userInputStore.removePreset(presetId);
};

const onStartBulkOperationClick = async () => {
    userInputStore.setBulkOperationStartDate(Date.now());
    userInputStore.setBulkOperationPresetIndex(0);
    userInputStore.setUpscale(userInputStore.bulkOperationUpscale);
    userInputStore.setImageCount(userInputStore.bulkOperationImageCount);
    userInputStore.applyPreset(
        userInputStore.selectedBulkPresets[userInputStore.setBulkOperationPresetIndex],
    );

    await generatorStore.queueImageJob();
};

const onCancelBulkOperationClick = () => {
    userInputStore.setBulkOperationStartDate(null);
    generatorStore.cancelAllJobs();
};
</script>
