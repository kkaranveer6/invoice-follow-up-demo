'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { LayoutDashboard, Menu, Settings, Users } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <span className="font-heading text-lg font-bold text-indigo-600">
          Invoice Follow-Up
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                isActive
                  ? 'bg-indigo-50 font-medium text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-4 py-4">
        <UserButton />
      </div>
    </div>
  )
}

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger + sheet — client-only to avoid Radix hydration mismatch */}
      <div className="sticky top-0 z-20 flex items-center border-b bg-white px-4 py-3 lg:hidden">
        {mounted ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon">
            <Menu size={20} />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
        <span className="ml-3 font-heading text-lg font-bold text-indigo-600">
          Invoice Follow-Up
        </span>
      </div>
    </>
  )
}
