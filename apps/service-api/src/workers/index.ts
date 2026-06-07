import { tasksWorker } from './tasks.worker.js'
import { closeQueues } from './queues.js'

export async function startWorkers() {
  console.log('[workers] started')
}

export async function stopWorkers() {
  await tasksWorker.close()
  await closeQueues()
  console.log('[workers] stopped')
}
