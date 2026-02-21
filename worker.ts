import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { OpenWorkflow } from 'openworkflow'
import { BackendPostgres } from 'openworkflow/postgres'
import cron from 'node-cron'
import { processReminders } from './src/lib/reminders'

async function main() {
  const backend = await BackendPostgres.connect(process.env.OPENWORKFLOW_POSTGRES_URL!)

  const ow = new OpenWorkflow({ backend })

  const invoiceRemindersWorkflow = ow.defineWorkflow(
    { name: 'invoice-reminders' },
    async ({ step }) => {
      return await step.run({ name: 'process-reminders' }, () => processReminders())
    },
  )

  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      await invoiceRemindersWorkflow.run(undefined, {
        idempotencyKey: `invoice-reminders-${today}`,
      })
      console.log(`[${today}] Invoice reminders workflow triggered`)
    } catch (err) {
      console.error('[invoice-reminders] Cron trigger failed:', err)
    }
  })

  const worker = ow.newWorker()

  async function shutdown() {
    await worker.stop()
    await backend.stop()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  console.log('Worker started. Invoice reminders scheduled daily at midnight.')
  await worker.start()
}

main().catch(console.error)
