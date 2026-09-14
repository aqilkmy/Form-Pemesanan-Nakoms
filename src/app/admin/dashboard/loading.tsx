import { AdminDashboardSkeleton } from "@/components/shared/Skeletons";

export default function AdminDashboardLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
        </div>
        <AdminDashboardSkeleton />
      </div>
    </main>
  );
}
