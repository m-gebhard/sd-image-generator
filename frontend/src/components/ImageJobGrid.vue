<template>
    <section class="image-grid">
        <v-row>
            <v-col cols="12" align-self="center" class="d-flex flex-row flex-nowrap align-center">
                <v-checkbox
                    v-model="userInputStore.shouldSaveAllImages"
                    color="primary"
                    hide-details
                    width="auto"
                    label="Save all Images"
                    title="Save all images instead of discarding them on page reload"
                    class="mb-0"
                />
            </v-col>
        </v-row>

        <v-row>
            <v-expansion-panels variant="accordion" multiple flat eager v-model="openedAccordions">
                <transition-group name="list">
                    <template v-for="(group, i) in stableGroups" :key="group.stableKey">
                        <v-expansion-panel>
                            <v-expansion-panel-title class="flex-wrap">
                                <span>[{{ stableGroups.length - i }}] {{ group.jobId }}</span>
                                <v-btn
                                    color="grey"
                                    elevation="0"
                                    size="small"
                                    variant="outlined"
                                    class="ml-sm-5 mt-3 mt-sm-0"
                                    title="Download all Job images"
                                    @click.stop="() => onDownloadJobClick(group)"
                                >
                                    Download
                                </v-btn>
                                <template v-slot:actions="{ expanded }">
                                    <font-awesome-icon
                                        :icon="`fa-solid fa-caret-${expanded ? 'up' : 'down'}`"
                                    />
                                </template>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <v-row>
                                    <transition-group name="list">
                                        <v-col
                                            v-for="(image, i) in group.images"
                                            :key="image.id"
                                            cols="12"
                                            md="4"
                                            xl="2"
                                            class="position-relative"
                                        >
                                            <generated-image
                                                :image-object="image"
                                                @on-image-click="
                                                    (img) => onImageClick(group.images, i)
                                                "
                                            />
                                        </v-col>
                                    </transition-group>
                                </v-row>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </template>

                    <v-expansion-panel
                        v-show="favouritesStore.temporaryImagesOrdered?.length"
                        key="recent-images"
                        class="mb-7"
                    >
                        <v-expansion-panel-title class="flex-wrap">
                            <span class="mr-3"
                                >Saved ({{ favouritesStore.temporaryImagesOrdered.length }})</span
                            >
                            <v-btn
                                color="grey"
                                elevation="0"
                                size="small"
                                variant="outlined"
                                @click.stop="() => onDownloadJobClick(null)"
                            >
                                Download
                            </v-btn>
                            <template v-slot:actions="{ expanded }">
                                <font-awesome-icon
                                    :icon="`fa-solid fa-caret-${expanded ? 'up' : 'down'}`"
                                />
                            </template>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-row>
                                <transition-group name="list">
                                    <v-col
                                        v-for="(image, i) in favouritesStore.temporaryImagesOrdered"
                                        :key="image.id"
                                        cols="12"
                                        md="4"
                                        xl="2"
                                        class="position-relative"
                                    >
                                        <generated-image
                                            :image-object="image"
                                            @on-image-click="
                                                (img) =>
                                                    onImageClick(
                                                        favouritesStore.temporaryImagesOrdered,
                                                        i,
                                                    )
                                            "
                                        />
                                    </v-col>
                                </transition-group>
                            </v-row>
                            <v-btn
                                color="error"
                                class="mt-8"
                                @click.stop="onDeleteTemporaryImagesClick"
                            >
                                Delete saved Images
                            </v-btn>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </transition-group>
            </v-expansion-panels>
        </v-row>
    </section>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref, computed, watch } from 'vue';
import { useLightboxStore } from '@/stores/lightbox.js';
import GeneratedImage from '@/components/GeneratedImage.vue';
import { useUserInputStore } from '@/stores/userInput.js';
import zipper from '@/utils/zipper.js';
import { useFavouritesStore } from '@/stores/favourites.js';

const favouritesStore = useFavouritesStore();
const lightboxStore = useLightboxStore();
const userInputStore = useUserInputStore();

// Define props
const props = defineProps({
    groups: Array,
});

// Local state for opened accordions
const openedAccordions = ref([]);

// Create a stable version of groups with stable keys
const stableGroups = computed(() => {
    const groups = props.groups
        .map((group, index) => ({
            ...group,
            stableKey: group.stableKey || `${group.jobId}-${index}`,
        }))
        .filter((g) => g?.images?.length);
    groups.sort((a, b) => a.startTime - b.startTime);

    return groups;
});

const onImageClick = (images, i) => {
    lightboxStore.setImagesMeta(images);
    lightboxStore.open(
        images.map((img) => img.base64),
        i,
    );
};

const onToggleKeepJobsClick = (value) => {
    userInputStore.setShouldSaveAllImages(value);
};

const onDownloadJobClick = async (group) => {
    if (group) {
        await zipper(
            group.images.map((img) => img.base64),
            `${group.jobId}.zip`,
        );
    } else {
        await zipper(
            favouritesStore.temporaryImagesOrdered.map((img) => img.base64),
            `saved.zip`,
        );
    }
};

const onDeleteTemporaryImagesClick = () => {
    favouritesStore.clearTemporaryImages();
};

let previousGroupCount = 0;

watch(
    () => stableGroups.value,
    (newGroups) => {
        const newGroupCount = newGroups.length;

        if (newGroupCount > previousGroupCount) {
            const addedGroups = newGroupCount - previousGroupCount;

            // Shift existing opened accordions indices
            const shiftedAccordions = openedAccordions.value.map((index) => index + addedGroups);

            if (!userInputStore.bulkOperationStartDate) {
                // Ensure the newest group is initially opened
                openedAccordions.value = [0, ...shiftedAccordions];
            }
        }

        previousGroupCount = newGroupCount;
    },
    { immediate: true },
);
</script>
