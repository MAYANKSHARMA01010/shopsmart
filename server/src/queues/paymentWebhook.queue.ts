import { Queue } from 'bullmq';
import redis from '../utils/redis';

export const paymentWebhookQueue = new Queue('payment-webhook', { 
  connection: redis 
});

export const enqueueWebhook = async (eventId: string, gateway: string, payload: any) => {
  await paymentWebhookQueue.add(
    'process-webhook',
    { eventId, gateway, payload },
    {
      jobId: eventId,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );
};
