<template>
    <v-img
        :src="imageObject.base64"
        :lazy-src="imageObject.base64"
        :alt="imageObject.meta?.prompt"
        :title="imageObject.meta?.prompt"
        aspect-ratio="1"
        cover
        rounded
        class="generated-image"
        @click.prevent="$emit('onImageClick', imageObject)"
    >
        <image-toolbar :image="imageObject" :dimensions="imageDimensions" />
    </v-img>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ImageToolbar from '@/components/ImageToolbar.vue';

const props = defineProps({
    imageObject: Object,
});

defineEmits(['onImageClick']);

const imageDimensions = ref(null);
const imageObject = props.imageObject;

const calculateDimensions = () => {
    if (!imageObject?.base64) return;
    const img = new Image();
    img.onload = () => {
        imageDimensions.value = { width: img.width, height: img.height };
        imageObject.meta.dimensions = { width: img.width, height: img.height };
    };
    img.src = imageObject.base64;
    img.remove();
};

onMounted(() => {
    calculateDimensions();
});
</script>
