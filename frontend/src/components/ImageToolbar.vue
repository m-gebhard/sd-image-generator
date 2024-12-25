<template>
    <v-row class="image-toolbar pa-2" align="center" align-content="end" justify="start">
        <v-col cols="2" align-self="end">
            <span v-if="dimensions" class="text-caption">
                {{ dimensions.width }}x{{ dimensions.height }}
            </span>
        </v-col>
        <v-col cols="10" align-self="end">
            <v-btn
                icon="fa-solid fa-caret-up"
                color="primary"
                size="small"
                elevation="0"
                :title="isFavourite ? 'Un-Favourite' : 'Favourite'"
                @click.stop="onFavouriteClick"
            >
                <font-awesome-icon
                    :icon="`fa-${isFavourite ? 'solid' : 'regular'} fa-star`"
                    size="2x"
                />
            </v-btn>
            <v-btn
                icon="fa-solid fa-caret-up"
                color="primary"
                size="small"
                elevation="0"
                title="Use as Reference"
                @click.stop="onReferenceClick"
            >
                <font-awesome-icon :icon="`fa-solid fa-copy`" size="2x" />
            </v-btn>
        </v-col>
    </v-row>
</template>

<script setup>
import { useUserInputStore } from '@/stores/userInput.js';
import { useFavouritesStore } from '@/stores/favourites.js';
import { computed } from 'vue';
import { useNotificationsStore } from '@/stores/notification.js';

const props = defineProps({
    image: Object,
    dimensions: Object,
});

const favouritesStore = useFavouritesStore();
const inputStore = useUserInputStore();
const notificationStore = useNotificationsStore();

const onFavouriteClick = async () => {
    if (isFavourite.value) {
        await favouritesStore.removeFavourite(props.image.id);
    } else {
        await favouritesStore.addFavourite(props.image.id, props.image.base64, props.image.meta);
    }
};

const onReferenceClick = () => {
    const maxSize = 768;
    const isImageReferenceUsable = props.image?.meta?.dimensions?.width <= maxSize;

    if (isImageReferenceUsable) {
        inputStore.setReferenceImage(props.image.base64);
        inputStore.setGenerationType('generate_from_reference');
    } else {
        inputStore.setGenerationType('generate');
        inputStore.setReferenceImage(null);
        notificationStore.addNotification(
            `Reference images must be ${maxSize}x${maxSize} pixels or smaller.`,
            'error',
        );
    }

    inputStore.setPrompt(props.image.meta?.prompt);
    inputStore.setNegativePrompt(props.image.meta?.negative_prompt);
};

const isFavourite = computed(() => favouritesStore.isFavourite(props.image.id));
</script>
