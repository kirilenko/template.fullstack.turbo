import { startWorkers, stopWorkers } from './workers/index.js'

await startWorkers()
console.log('Worker process started')

const shutdown = async () => {
  console.log('Worker shutting down...')
  await stopWorkers()
  process.exit(0)
}

process.on('SIGTERM', () => void shutdown())
process.on('SIGINT', () => void shutdown())
