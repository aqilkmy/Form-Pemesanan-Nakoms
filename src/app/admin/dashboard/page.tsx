"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is authenticated
    const auth = sessionStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/admin");
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight mx-auto text-foreground">
            Admin Dashboard
          </h1>
          {/* <div className="flex items-center gap-4">
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Logout
                        </button>
                    </div> */}
        </div>
        <AdminDashboard />
      </div>
    </main>
  );
}
