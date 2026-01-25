
import { Navbar } from "@/components/layout/Navbar"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export const metadata = {
    title: 'Admin Dashboard - Order Content',
}

export default function AdminPage() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <div className="text-sm text-muted-foreground">
                        Realtime Monitoring
                    </div>
                </div>
                <AdminDashboard />
            </div>
        </main>
    )
}
