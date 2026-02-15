import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
