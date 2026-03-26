import { Navbar } from "@/components/layout/Navbar";
import { MonitoringDashboard } from "@/components/monitoring/MonitoringDashboard";

export const metadata = {
  title: "Monitoring Pesanan - Order Content",
};

export default function MonitoringPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Navbar />
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight mx-auto text-foreground">
            Monitoring Pesanan
          </h1>
        </div>
        <MonitoringDashboard />
      </div>
    </main>
  );
}
