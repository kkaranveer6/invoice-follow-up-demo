# Invoice Follow-Up

> Automated invoice reminder system — never chase payments manually again.

A demo SaaS application that connects to Stripe and automatically sends escalating email reminders to clients for overdue invoices. All data is fictional and for portfolio/demo purposes.

**Live demo:** [karanveer.github.io/invoice-follow-up-demo](https://karanveer.github.io/invoice-follow-up-demo)

---

## Features

### Automated Reminders
- Detects overdue invoices by syncing with Stripe
- Sends up to 3 escalating email reminders per invoice (friendly nudge → firm follow-up → final notice)
- Per-invoice toggle to pause/resume reminders

### Dashboard
- Overview cards: Stripe connection status, total invoices synced, reminders sent, overdue count
- Invoice table organized by status: **Overdue**, **Unpaid**, **Paid**
- Each row shows customer name, amount, due date, last reminder sent, and reminder count

### Customer Management
- Customer list with invoice summaries broken down by status (Draft, Open, Paid, Void, Uncollectible)

### Billing
- 14-day free trial, $29/month Pro plan
- Billing success and cancellation pages

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js (App Router), React 19 |
| Styling | Tailwind CSS 4, clsx, tailwind-merge |
| UI Components | Radix UI, Lucide React, shadcn/ui-style components |
| Variant System | Class Variance Authority (CVA) |
| Fonts | DM Sans (headings), Source Sans 3 (body) |
| Language | TypeScript |
| Testing | Vitest |
| Linting | ESLint 9, Prettier |
| Deployment | Static export → GitHub Pages |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── pricing/                  # Pricing page
│   ├── billing/success|cancel/   # Post-checkout pages
│   ├── privacy/ & terms/         # Legal pages
│   └── dashboard/
│       ├── page.tsx              # Main dashboard
│       ├── customers/            # Customer list
│       ├── invoices/             # Invoice list
│       └── settings/             # Account & integrations
├── components/
│   ├── sidebar.tsx               # Responsive sidebar (desktop fixed, mobile sheet)
│   ├── reminder-toggle.tsx       # Per-invoice pause/resume toggle
│   └── ui/                       # Reusable component library
└── lib/
    └── demo-data.ts              # Sample invoices, customers, and stats
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Other commands

```bash
npm run build    # Static export to /out
npm test         # Run unit tests (Vitest)
npm run lint     # ESLint
```

---

## Notes

- This is a **demo only** — all invoice and customer data is fictional
- No backend or real Stripe connection; a production version would use the Stripe API and a database (Prisma schema included as reference)
- A blue banner is shown in the app to indicate demo mode
