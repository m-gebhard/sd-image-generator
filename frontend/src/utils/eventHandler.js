import { useGeneratorStore } from '@/stores/generator.js';
import { useNotificationsStore } from '@/stores/notification.js';
import { useLoginStore } from '@/stores/login.js';

export default (data) => {
    const generatorStore = useGeneratorStore();
    const notificationStore = useNotificationsStore();

    switch (data.type) {
        case 'error':
            console.error(data.error);
            notificationStore.addNotification(data.error, 'error');

            if (data.error === 'Invalid token') {
                const loginStore = useLoginStore();
                loginStore.setToken('');
                window.location.reload();
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
            break;
        case 'progress':
            if (data.status === 'completed') {
                generatorStore.removeJob(data.job_id);
                generatorStore.addFinishedJob(data.job_id);

                notificationStore.addNotification(`Job: ${data.job_id} completed`, 'success');
            } else {
                if (data.status === 'cancelled') {
                    generatorStore.removeJob(data.job_id);
                } else {
                    generatorStore.updateJobProgress(data.job_id, data.completed, data.total);
                }
            }
    }
};
