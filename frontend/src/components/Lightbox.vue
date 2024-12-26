<template>
    <vue-easy-lightbox
        :visible="lightboxStore.isOpen"
        :imgs="lightboxStore.images"
        :index="lightboxStore.index"
        loop
        :max-zoom="10"
        :zoom-scale="0.5"
        teleport="#app"
        @hide="
            lightboxStore.close();
            scrollLock.unlock();
        "
    >
        <template v-slot:toolbar="{ toolbarMethods }">
            <v-row class="lightbox-toolbar">
                <v-col cols="12">
                    <v-btn
                        icon=""
                        elevation="0"
                        class="mr-2"
                        @click.stop="
                            () => onFavouriteClick(lightboxStore.imagesMeta[lightboxStore.index])
                        "
                    >
                        <font-awesome-icon
                            :icon="`fa-${isFavourite(lightboxStore.imagesMeta[lightboxStore.index]) ? 'solid' : 'regular'} fa-star`"
                            size="1x"
                        />
                    </v-btn>
                    <v-btn icon="" elevation="0" class="mr-2" @click="toolbarMethods.zoomIn">
                        <svg class="vel-icon icon" aria-hidden="true">
                            <use xlink:href="#icon-zoomin"></use>
                        </svg>
                    </v-btn>
                    <v-btn icon="" elevation="0" class="mr-2" @click="toolbarMethods.zoomOut">
                        <svg class="vel-icon icon" aria-hidden="true">
                            <use xlink:href="#icon-zoomout"></use>
                        </svg>
                    </v-btn>
                    <v-btn icon="" elevation="0" class="mr-2" @click="toolbarMethods.resize">
                        <svg class="vel-icon icon" aria-hidden="true">
                            <use xlink:href="#icon-resize"></use>
                        </svg>
                    </v-btn>
                    <v-btn icon="" elevation="0" class="mr-2" @click="toolbarMethods.rotateLeft">
                        <svg class="vel-icon icon" aria-hidden="true">
                            <use xlink:href="#icon-rotate-left"></use>
                        </svg>
                    </v-btn>
                    <v-btn icon="" elevation="0" @click="toolbarMethods.rotateRight">
                        <svg class="vel-icon icon" aria-hidden="true">
                            <use xlink:href="#icon-rotate-right"></use>
                        </svg>
                    </v-btn>
                </v-col>
            </v-row>
        </template>
    </vue-easy-lightbox>
</template>

<script setup>
import { useLightboxStore } from '@/stores/lightbox.js';
import { useFavouritesStore } from '@/stores/favourites.js';
import scrollLock from '@/utils/scrollLock.js';

const lightboxStore = useLightboxStore();
const favouritesStore = useFavouritesStore();

const onFavouriteClick = async (image) => {
    if (isFavourite(image)) {
        await favouritesStore.removeFavourite(image.id);
    } else {
        await favouritesStore.addFavourite(image.id, image.base64, image.meta);
    }
};

const isFavourite = (image) => favouritesStore.isFavourite(image.id);
</script>
