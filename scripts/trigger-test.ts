import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { OpenWorkflow } from 'openworkflow'
import { BackendPostgres } from 'openworkflow/postgres'
import { processReminders } from '../src/lib/reminders'

async function main() {
  const backend = await BackendPostgres.connect(process.env.OPENWORKFLOW_POSTGRES_URL!)
  const ow = new OpenWorkflow({ backend })

  const invoiceRemindersWorkflow = ow.defineWorkflow(
    { name: 'invoice-reminders' },
    async ({ step }) => {
      return await step.run({ name: 'process-reminders' }, () => processReminders())
    },
  )

  const handle = await invoiceRemindersWorkflow.run(undefined, {
    idempotencyKey: `invoice-reminders-test-${Date.now()}`,
  })

  console.log('Workflow triggered, waiting for result...')
  const result = await handle.result()
  console.log('Result:', result)

  await backend.stop()
  process.exit(0)
}

main().catch(console.error)
