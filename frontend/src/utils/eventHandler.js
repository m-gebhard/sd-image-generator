import { useGeneratorStore } from '@/stores/generator.js';
import { useNotificationsStore } from '@/stores/notification.js';
import { useLoginStore } from '@/stores/login.js';
import { useUserInputStore } from '@/stores/userInput.js';
import { useFavouritesStore } from '@/stores/favourites.js';
import { uuid as $uuid } from 'vue-uuid';
import sleep from '@/utils/sleep.js';

export default async (data) => {
    const generatorStore = useGeneratorStore();
    const notificationStore = useNotificationsStore();
    const userInputStore = useUserInputStore();

    switch (data.type) {
        case 'error':
            console.error(data.error);
            notificationStore.addNotification(data.error, 'error');

            if (data.error === 'Invalid token') {
                const loginStore = useLoginStore();
                loginStore.setToken('');
                window.location.reload();
            } else {
                if (userInputStore.bulkOperationStartDate) {
                    notificationStore.addNotification(
                        `An error occurred during the bulk-operation. Retrying after 60 seconds.`,
                        'error',
                    );

                    await sleep(60000);

                    startNextBulkOperationJob(userInputStore, generatorStore);
                }
            }
            break;
        case 'queue_add':
            generatorStore.addJob(data.job_id);
            notificationStore.addNotification(`Queued job: ${data.job_id}`, 'success');
            break;
        case 'queue_job_cancel':
            generatorStore.removeJob(data.job_id);
            generatorStore.addFinishedJob(data.job_id);
            break;
        case 'generated_image':
            generatorStore.addGeneratedImage(data.image, data.job_id, data.meta);

            if (userInputStore.shouldSaveAllImages) {
                const favouritesStore = useFavouritesStore();
                favouritesStore.addTemporarySavedImage($uuid.v4(), data.image, data.meta);
            }
            break;
        case 'progress':
            if (data.status === 'completed') {
                generatorStore.removeJob(data.job_id);
                generatorStore.addFinishedJob(data.job_id);

                notificationStore.addNotification(`Job: ${data.job_id} completed`, 'success');

                await sleep(5000);

                if (userInputStore.bulkOperationStartDate) {
                    startNextBulkOperationJob(userInputStore, generatorStore);
                }
            } else {
                if (data.status === 'cancelled') {
                    generatorStore.removeJob(data.job_id);
                } else {
                    generatorStore.updateJobProgress(data.job_id, data.completed, data.total);
                }
            }
    }
};

const startNextBulkOperationJob = (userInputStore, generatorStore) => {
    const newIndex = userInputStore.setBulkOperationPresetIndex(
        userInputStore.currentBulkOperationPresetIndex + 1,
    );

    if (newIndex >= userInputStore.selectedBulkPresets.length) {
        userInputStore.setBulkOperationPresetIndex(0);
    }

    userInputStore.applyPreset(
        userInputStore.selectedBulkPresets[userInputStore.currentBulkOperationPresetIndex]?.id,
    );

    generatorStore.queueImageJob();
};
