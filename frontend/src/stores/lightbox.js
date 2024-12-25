import { defineStore } from 'pinia';
import { ref } from 'vue';
import scrollLock from '@/utils/scrollLock.js';

export const useLightboxStore = defineStore('light-box', () => {
    const isOpen = ref(false);
    const images = ref([]);
    const imagesMeta = ref([]);
    const index = ref(0);

    const open = (newImages, startIndex = 0) => {
        isOpen.value = true;
        images.value = [...newImages];
        index.value = startIndex;
        scrollLock.lock();
    };

    const setImagesMeta = (newImagesMeta) => {
        imagesMeta.value = [...newImagesMeta];
    };

    const close = () => {
        isOpen.value = false;
        images.value = [];
        index.value = 0;
    };

    const next = () => {
        index.value = (index.value + 1) % images.value.length;
    };

    const previous = () => {
        index.value = (index.value - 1 + images.value.length) % images.value.length;
    };

    return {
        isOpen,
        images,
        index,
        open,
        close,
        next,
        previous,
        imagesMeta,
        setImagesMeta,
    };
});
