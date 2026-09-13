"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { checkAdminAuth, logoutAdmin } from "@/lib/actions/auth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function verify() {
      const isAuthed = await checkAdminAuth();
      if (isAuthed) {
        setIsAuthenticated(true);
      } else {
        router.push("/admin");
      }
      setIsLoading(false);
    }
    verify();
  }, [router]);

  const handleLogout = async () => {
    await logoutAdmin();
    window.dispatchEvent(new Event("adminAuthChange"));
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
        <AdminDashboard />
      </div>
    </main>
  );
}
