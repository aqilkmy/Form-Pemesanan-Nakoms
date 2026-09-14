import { CalendarSkeleton } from "@/components/shared/Skeletons";

export default function JadwalLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight mx-auto text-foreground">
            Jadwal Publikasi
          </h1>
        </div>
        <CalendarSkeleton />
      </div>
    </main>
  );
}
