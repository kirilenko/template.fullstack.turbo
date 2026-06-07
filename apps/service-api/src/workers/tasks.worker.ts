import { Worker } from 'bullmq'

import { getRedisConnection } from '../lib/redis.js'

const connection = getRedisConnection()

// Each worker instance processes jobs from the 'tasks' queue.
// To scale: run multiple worker containers (Dokploy: deploy.replicas).
export const tasksWorker = new Worker(
  'tasks',
  async (job) => {
    console.log(`[tasks-worker] processing job ${job.id} (${job.name})`, job.data)

    // TODO: implement your job processing logic here
    await new Promise((resolve) => setTimeout(resolve, 100))

    console.log(`[tasks-worker] job ${job.id} done`)
  },
  { connection },
)

tasksWorker.on('failed', (job, err) => {
  console.error(`[tasks-worker] job ${job?.id} failed:`, err)
})
