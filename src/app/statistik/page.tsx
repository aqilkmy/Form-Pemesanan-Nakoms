import { StatistikDashboard } from "@/components/statistik/StatistikDashboard";

export const metadata = {
  title: "Statistik Triwulan - Pemesanan Rizzmed",
  description: "Statistik pesanan per triwulan BEM Unsoed 2026",
};

export default function StatistikPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight mx-auto text-foreground">
            Statistik Triwulan
          </h1>
        </div>
        <StatistikDashboard />
      </div>
    </main>
  );
}
