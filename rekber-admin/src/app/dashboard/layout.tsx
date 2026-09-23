"use client"

import { useState } from "react"
import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="lg:pl-64">
          <DashboardHeader onMenuClick={() => setIsMobileMenuOpen((open) => !open)} />
          {/* Mobile: padding 12px (p-3). Tablet: 16px (sm:p-4). Desktop: 24px (md:p-6) */}
          <main className="p-3 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
