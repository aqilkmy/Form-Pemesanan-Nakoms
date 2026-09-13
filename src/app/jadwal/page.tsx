import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { getOrders } from "@/lib/actions/orders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jadwal Publikasi - Pemesanan Rizzmed",
};

export default async function JadwalPage() {
  const { data } = await getOrders();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight mx-auto text-foreground">
            Jadwal Publikasi
          </h1>
        </div>
        <ScheduleCalendar initialOrders={data || []} />
      </div>
    </main>
  );
}
