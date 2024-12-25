<template>
    <section class="image-grid">
        <v-row>
            <v-expansion-panels variant="accordion" multiple flat eager v-model="openedAccordions">
                <transition-group name="list">
                    <template v-for="(group, i) in stableGroups" :key="group.stableKey">
                        <v-expansion-panel>
                            <v-expansion-panel-title>
                                <span>[{{ stableGroups.length - i }}] {{ group.jobId }}</span>
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

const lightboxStore = useLightboxStore();

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

let previousGroupCount = 0;

watch(
    () => stableGroups.value,
    (newGroups) => {
        const newGroupCount = newGroups.length;

        if (newGroupCount > previousGroupCount) {
            const addedGroups = newGroupCount - previousGroupCount;

            // Shift existing opened accordions indices
            const shiftedAccordions = openedAccordions.value.map((index) => index + addedGroups);

            // Ensure the newest group is opened (always at index 0 for new items at the top)
            openedAccordions.value = [0, ...shiftedAccordions];
        }

        previousGroupCount = newGroupCount;
    },
    { immediate: true },
);
</script>
