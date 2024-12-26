<template>
    <div class="favourites-view">
        <v-row>
            <v-col>
                <span>{{ favouritesStore.favouritesOrdered.length }} Favourites</span>
                <v-btn class="ml-5 pl-2 pr-2" flat color="primary" @click="onDownloadAllClick">
                    Download All
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                v-for="(image, i) in favouritesStore.favouritesOrdered"
                :key="image.id"
                cols="12"
                md="4"
                xl="2"
                class="position-relative"
            >
                <generated-image
                    :image-object="image"
                    @on-image-click="(img) => onImageClick(image, i)"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { useFavouritesStore } from '@/stores/favourites.js';
import { useLightboxStore } from '@/stores/lightbox.js';
import zipper from '@/utils/zipper.js';
import GeneratedImage from '@/components/GeneratedImage.vue';

const lightboxStore = useLightboxStore();
const favouritesStore = useFavouritesStore();

const onImageClick = (image, i) => {
    lightboxStore.setImagesMeta(favouritesStore.favouritesOrdered);
    lightboxStore.open(
        favouritesStore.favouritesOrdered.map((img) => img.base64),
        i,
    );
};

const onDownloadAllClick = async () => {
    await zipper(
        favouritesStore.favouritesOrdered.map((img) => img.base64),
        'favourites.zip',
    );
};
</script>
