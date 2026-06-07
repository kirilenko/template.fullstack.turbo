import { Queue } from 'bullmq'

import { getRedisConnection } from '../lib/redis.js'

const connection = getRedisConnection()

// Add your queues here
export const tasksQueue = new Queue('tasks', { connection })

export async function closeQueues() {
  await tasksQueue.close()
}
