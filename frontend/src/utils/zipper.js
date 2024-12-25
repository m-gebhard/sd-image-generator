import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const zipEncodedImages = async (base64Images, zipFilename = 'images.zip') => {
    if (!Array.isArray(base64Images) || base64Images.length === 0) {
        throw new Error('No images provided for zipping.');
    }

    const zip = new JSZip();

    base64Images.forEach((base64Image, index) => {
        const base64Data = base64Image.split(',')[1];
        const binaryData = atob(base64Data);

        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            byteArray[i] = binaryData.charCodeAt(i);
        }

        zip.file(`image_${index + 1}.png`, byteArray);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, zipFilename);
};

export default zipEncodedImages;
