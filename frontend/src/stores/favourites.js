import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
    clearDatabase,
    deleteDatabaseImage,
    getAllDatabaseImages,
    saveImageToDatabase,
} from '@/utils/imagesDatabase.js';
import bgChanger from '@/utils/bgChanger.js';

export const useFavouritesStore = defineStore('favourites', () => {
    const favourites = ref([]);
    const temporarySavedImages = ref([]);
    const isLoading = ref(false);

    const addFavourite = async (id, base64, meta) => {
        await saveImageToDatabase(id, base64, meta);

        bgChanger(base64);

        favourites.value.push({ id, base64, meta });
    };
    const removeFavourite = async (imageId) => {
        await deleteDatabaseImage(imageId);

        const index = favourites.value.findIndex((fav) => fav.id === imageId);

        if (index !== -1) {
            favourites.value.splice(index, 1);
        }
    };

    const loadFavourites = async () => {
        isLoading.value = true;
        favourites.value = await getAllDatabaseImages();
        isLoading.value = false;

        if (favourites.value?.length) {
            const randomImage =
                favourites.value[(Math.random() * favourites.value?.length) | 0]?.base64;

            bgChanger(randomImage);
        }
    };

    const isFavourite = (id) => favourites.value.some((fav) => fav.id === id);

    const favouritesOrdered = computed(() => {
        const favs = [...favourites.value];
        favs.sort((a, b) => (b.meta.date || 0) - (a.meta.date || 0));
        return favs;
    });

    // Temporary images
    const addTemporarySavedImage = async (id, base64, meta) => {
        meta.date = Date.now();

        await saveImageToDatabase(id, base64, meta, 'SavedImages');

        temporarySavedImages.value.push({ id, base64, meta });
    };

    const loadTemporaryImages = async () => {
        temporarySavedImages.value = await getAllDatabaseImages('SavedImages');
    };

    const clearTemporaryImages = async () => {
        await clearDatabase('SavedImages');
        temporarySavedImages.value = [];
    };

    const temporaryImagesOrdered = computed(() => {
        const favs = [...temporarySavedImages.value];
        favs.sort((a, b) => (b.meta.date || 0) - (a.meta.date || 0));
        return favs;
    });

    return {
        favourites,
        favouritesOrdered,
        loadFavourites,
        addFavourite,
        removeFavourite,
        isLoading,
        isFavourite,
        addTemporarySavedImage,
        loadTemporaryImages,
        clearTemporaryImages,
        temporaryImagesOrdered,
    };
});
