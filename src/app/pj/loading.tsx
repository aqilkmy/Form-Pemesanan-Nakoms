import { PJPageSkeleton } from "@/components/shared/Skeletons";

export default function PJLoading() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <PJPageSkeleton />
        </div>
      </div>
    </main>
  );
}
