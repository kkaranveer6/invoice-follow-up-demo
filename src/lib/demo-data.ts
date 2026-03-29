// Demo data shapes match the Prisma Invoice model and Stripe CustomerWithInvoiceSummary
// used by the real dashboard pages.

export type InvoiceStatus = 'overdue' | 'unpaid' | 'paid'

export interface DemoInvoice {
  id: string
  customerName: string
  customerEmail: string
  invoiceNumber: string
  amount: number       // in cents
  currency: string
  dueDate: Date
  status: InvoiceStatus
  lastReminderSentAt: Date | null
  reminderCount: number
  remindersEnabled: boolean
}

export interface DemoCustomer {
  id: string
  name: string | null
  email: string | null
  invoiceSummary: {
    draft: number
    open: number
    paid: number
    void: number
    uncollectible: number
  }
}

export interface DemoStats {
  invoiceCount: number
  remindersSent: number
  lastSyncedAt: Date
}

export const DEMO_INVOICES: DemoInvoice[] = [
  {
    id: '1',
    customerName: 'Greenfield Plumbing',
    customerEmail: 'billing@greenfieldplumbing.com',
    invoiceNumber: 'INV-2025-0041',
    amount: 320000,
    currency: 'usd',
    dueDate: new Date('2026-01-15'),
    status: 'overdue',
    lastReminderSentAt: new Date('2026-03-10'),
    reminderCount: 3,
    remindersEnabled: true,
  },
  {
    id: '2',
    customerName: 'Blue Ridge Salon',
    customerEmail: 'accounts@blueridgesalon.com',
    invoiceNumber: 'INV-2025-0052',
    amount: 87500,
    currency: 'usd',
    dueDate: new Date('2026-02-01'),
    status: 'overdue',
    lastReminderSentAt: new Date('2026-03-18'),
    reminderCount: 2,
    remindersEnabled: true,
  },
  {
    id: '3',
    customerName: 'Metro Print Shop',
    customerEmail: 'metro@printshop.io',
    invoiceNumber: 'INV-2026-0003',
    amount: 27550,
    currency: 'usd',
    dueDate: new Date('2026-01-30'),
    status: 'overdue',
    lastReminderSentAt: new Date('2026-03-25'),
    reminderCount: 3,
    remindersEnabled: false,
  },
  {
    id: '4',
    customerName: 'Oakwood Auto Repair',
    customerEmail: 'invoices@oakwoodauto.com',
    invoiceNumber: 'INV-2026-0011',
    amount: 375000,
    currency: 'usd',
    dueDate: new Date('2026-04-10'),
    status: 'unpaid',
    lastReminderSentAt: new Date('2026-03-15'),
    reminderCount: 1,
    remindersEnabled: true,
  },
  {
    id: '5',
    customerName: 'Sunrise Catering Co.',
    customerEmail: 'finance@sunrisecatering.com',
    invoiceNumber: 'INV-2026-0014',
    amount: 90000,
    currency: 'usd',
    dueDate: new Date('2026-04-15'),
    status: 'unpaid',
    lastReminderSentAt: null,
    reminderCount: 0,
    remindersEnabled: true,
  },
  {
    id: '6',
    customerName: 'Harborview Consulting',
    customerEmail: 'billing@harborview.co',
    invoiceNumber: 'INV-2026-0017',
    amount: 550000,
    currency: 'usd',
    dueDate: new Date('2026-04-30'),
    status: 'unpaid',
    lastReminderSentAt: null,
    reminderCount: 0,
    remindersEnabled: true,
  },
  {
    id: '7',
    customerName: 'Pinehill Events',
    customerEmail: 'pinehill@events.com',
    invoiceNumber: 'INV-2026-0019',
    amount: 148000,
    currency: 'usd',
    dueDate: new Date('2026-05-01'),
    status: 'unpaid',
    lastReminderSentAt: null,
    reminderCount: 0,
    remindersEnabled: false,
  },
  {
    id: '8',
    customerName: 'Greenfield Plumbing',
    customerEmail: 'billing@greenfieldplumbing.com',
    invoiceNumber: 'INV-2025-0029',
    amount: 210000,
    currency: 'usd',
    dueDate: new Date('2025-11-30'),
    status: 'paid',
    lastReminderSentAt: new Date('2025-11-20'),
    reminderCount: 2,
    remindersEnabled: true,
  },
  {
    id: '9',
    customerName: 'Blue Ridge Salon',
    customerEmail: 'accounts@blueridgesalon.com',
    invoiceNumber: 'INV-2025-0035',
    amount: 45000,
    currency: 'usd',
    dueDate: new Date('2025-12-15'),
    status: 'paid',
    lastReminderSentAt: new Date('2025-12-10'),
    reminderCount: 1,
    remindersEnabled: true,
  },
  {
    id: '10',
    customerName: 'Oakwood Auto Repair',
    customerEmail: 'invoices@oakwoodauto.com',
    invoiceNumber: 'INV-2025-0038',
    amount: 62000,
    currency: 'usd',
    dueDate: new Date('2025-12-31'),
    status: 'paid',
    lastReminderSentAt: null,
    reminderCount: 0,
    remindersEnabled: true,
  },
]

export const DEMO_STATS: DemoStats = {
  invoiceCount: 10,
  remindersSent: 15,
  lastSyncedAt: new Date('2026-03-28T09:00:00'),
}

export const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: 'cus_1',
    name: 'Greenfield Plumbing',
    email: 'billing@greenfieldplumbing.com',
    invoiceSummary: { draft: 0, open: 1, paid: 2, void: 0, uncollectible: 0 },
  },
  {
    id: 'cus_2',
    name: 'Blue Ridge Salon',
    email: 'accounts@blueridgesalon.com',
    invoiceSummary: { draft: 0, open: 1, paid: 1, void: 0, uncollectible: 0 },
  },
  {
    id: 'cus_3',
    name: 'Metro Print Shop',
    email: 'metro@printshop.io',
    invoiceSummary: { draft: 0, open: 1, paid: 0, void: 0, uncollectible: 0 },
  },
  {
    id: 'cus_4',
    name: 'Oakwood Auto Repair',
    email: 'invoices@oakwoodauto.com',
    invoiceSummary: { draft: 0, open: 1, paid: 1, void: 0, uncollectible: 0 },
  },
  {
    id: 'cus_5',
    name: 'Sunrise Catering Co.',
    email: 'finance@sunrisecatering.com',
    invoiceSummary: { draft: 1, open: 1, paid: 0, void: 0, uncollectible: 0 },
  },
  {
    id: 'cus_6',
    name: 'Harborview Consulting',
    email: 'billing@harborview.co',
    invoiceSummary: { draft: 0, open: 1, paid: 0, void: 1, uncollectible: 0 },
  },
]
