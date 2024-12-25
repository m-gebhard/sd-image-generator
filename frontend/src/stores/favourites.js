import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
    deleteFavoriteImage,
    getAllFavoriteImages,
    saveImageToFavorites,
} from '@/utils/favouritesDatabase.js';
import bgChanger from '@/utils/bgChanger.js';

export const useFavouritesStore = defineStore('favourites', () => {
    const favourites = ref([]);
    const isLoading = ref(false);

    const addFavourite = async (id, base64, meta) => {
        await saveImageToFavorites(id, base64, meta);

        bgChanger(base64);

        favourites.value.push({ id, base64, meta });
    };
    const removeFavourite = async (imageId) => {
        await deleteFavoriteImage(imageId);

        const index = favourites.value.findIndex((fav) => fav.id === imageId);

        if (index !== -1) {
            favourites.value.splice(index, 1);
        }
    };

    const loadFavourites = async () => {
        isLoading.value = true;
        favourites.value = await getAllFavoriteImages();
        isLoading.value = false;

        if (favourites.value?.length) {
            const randomImage =
                favourites.value[(Math.random() * favourites.value?.length) | 0]?.base64;

            bgChanger(randomImage);
        }
    };

    const isFavourite = (id) => favourites.value.some((fav) => fav.id === id);

    const favouritesReversed = computed(() => {
        const favs = [...favourites.value];
        favs.sort((a, b) => (b.meta.date || 0) - (a.meta.date || 0));
        return favs;
    });

    return {
        favourites,
        favouritesReversed,
        loadFavourites,
        addFavourite,
        removeFavourite,
        isLoading,
        isFavourite,
    };
});
