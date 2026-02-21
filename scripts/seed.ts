/**
 * Seed script: creates a test user and invoices covering all reminder scenarios.
 *
 * Run:  npx tsx seed.ts
 * Reset: npx tsx seed.ts --reset   (deletes seed data first)
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const SEED_CLERK_ID = 'seed_test_user_001'

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysFromNow(n: number): Date {
  return daysAgo(-n)
}

async function reset() {
  const user = await db.user.findUnique({ where: { clerkId: SEED_CLERK_ID } })
  if (!user) return
  await db.emailLog.deleteMany({ where: { invoice: { userId: user.id } } })
  await db.invoice.deleteMany({ where: { userId: user.id } })
  await db.user.delete({ where: { clerkId: SEED_CLERK_ID } })
  console.log('Seed data deleted.')
}

async function seed() {
  // Upsert the test user
  const user = await db.user.upsert({
    where: { clerkId: SEED_CLERK_ID },
    update: {},
    create: {
      clerkId: SEED_CLERK_ID,
      email: 'owner@testbusiness.com',
    },
  })

  console.log(`User: ${user.email} (${user.id})`)

  const invoices = [
    // ── WILL FIRE ──────────────────────────────────────────────────────────────
    {
      label: '1st reminder due  (overdue 4d, reminderCount=0)',
      data: {
        externalInvoiceId: 'seed-inv-001',
        invoiceNumber: 'INV-001',
        customerName: 'Alice Martin',
        customerEmail: 'alice@example.com',
        amount: 150000, // $1,500.00
        currency: 'usd',
        dueDate: daysAgo(4),
        status: 'overdue' as const,
        reminderCount: 0,
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-001',
      },
    },
    {
      label: '2nd reminder due  (overdue 8d, reminderCount=1)',
      data: {
        externalInvoiceId: 'seed-inv-002',
        invoiceNumber: 'INV-002',
        customerName: 'Bob Chen',
        customerEmail: 'bob@example.com',
        amount: 320000, // $3,200.00
        currency: 'usd',
        dueDate: daysAgo(8),
        status: 'overdue' as const,
        reminderCount: 1,
        lastReminderSentAt: daysAgo(8),
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-002',
      },
    },
    {
      label: '3rd reminder due  (overdue 15d, reminderCount=2)',
      data: {
        externalInvoiceId: 'seed-inv-003',
        invoiceNumber: 'INV-003',
        customerName: 'Carol Davis',
        customerEmail: 'carol@example.com',
        amount: 75000, // $750.00
        currency: 'usd',
        dueDate: daysAgo(15),
        status: 'overdue' as const,
        reminderCount: 2,
        lastReminderSentAt: daysAgo(8),
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-003',
      },
    },
    // ── WILL SKIP ──────────────────────────────────────────────────────────────
    {
      label: 'Skip: too soon for 2nd reminder (overdue 5d, reminderCount=1, need 7d)',
      data: {
        externalInvoiceId: 'seed-inv-004',
        invoiceNumber: 'INV-004',
        customerName: 'Dan Foster',
        customerEmail: 'dan@example.com',
        amount: 50000, // $500.00
        currency: 'usd',
        dueDate: daysAgo(5),
        status: 'overdue' as const,
        reminderCount: 1,
        lastReminderSentAt: daysAgo(5),
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-004',
      },
    },
    {
      label: 'Skip: not yet 3 days overdue (overdue 1d, reminderCount=0)',
      data: {
        externalInvoiceId: 'seed-inv-005',
        invoiceNumber: 'INV-005',
        customerName: 'Eva Green',
        customerEmail: 'eva@example.com',
        amount: 25000, // $250.00
        currency: 'usd',
        dueDate: daysAgo(1),
        status: 'overdue' as const,
        reminderCount: 0,
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-005',
      },
    },
    {
      label: 'Skip: all 3 reminders already sent (reminderCount=3)',
      data: {
        externalInvoiceId: 'seed-inv-006',
        invoiceNumber: 'INV-006',
        customerName: 'Frank Hill',
        customerEmail: 'frank@example.com',
        amount: 90000, // $900.00
        currency: 'usd',
        dueDate: daysAgo(20),
        status: 'overdue' as const,
        reminderCount: 3,
        lastReminderSentAt: daysAgo(6),
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-006',
      },
    },
    {
      label: 'Skip: reminders disabled',
      data: {
        externalInvoiceId: 'seed-inv-007',
        invoiceNumber: 'INV-007',
        customerName: 'Grace Lee',
        customerEmail: 'grace@example.com',
        amount: 180000, // $1,800.00
        currency: 'usd',
        dueDate: daysAgo(10),
        status: 'overdue' as const,
        reminderCount: 0,
        remindersEnabled: false,
        paymentLink: 'https://pay.stripe.com/test/seed-007',
      },
    },
    {
      label: 'Skip: invoice is paid',
      data: {
        externalInvoiceId: 'seed-inv-008',
        invoiceNumber: 'INV-008',
        customerName: 'Henry Park',
        customerEmail: 'henry@example.com',
        amount: 60000, // $600.00
        currency: 'usd',
        dueDate: daysAgo(5),
        status: 'paid' as const,
        reminderCount: 1,
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-008',
      },
    },
    {
      label: 'Skip: not yet due (due in 7 days)',
      data: {
        externalInvoiceId: 'seed-inv-009',
        invoiceNumber: 'INV-009',
        customerName: 'Iris Wang',
        customerEmail: 'iris@example.com',
        amount: 120000, // $1,200.00
        currency: 'usd',
        dueDate: daysFromNow(7),
        status: 'unpaid' as const,
        reminderCount: 0,
        remindersEnabled: true,
        paymentLink: 'https://pay.stripe.com/test/seed-009',
      },
    },
  ]

  for (const { label, data } of invoices) {
    await db.invoice.upsert({
      where: { externalInvoiceId: data.externalInvoiceId },
      update: data,
      create: { ...data, userId: user.id },
    })
    console.log(`  [${label}]`)
  }

  console.log(`\nSeeded ${invoices.length} invoices.`)
  console.log('\nExpected processReminders() result:')
  console.log('  sent:    3  (INV-001, INV-002, INV-003)')
  console.log('  skipped: 6  (INV-004 through INV-009)')
  console.log('  failed:  0  (unless RESEND_API_KEY is invalid)')
}

async function main() {
  const doReset = process.argv.includes('--reset')
  if (doReset) {
    await reset()
  } else {
    await seed()
  }
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
