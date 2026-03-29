import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata = {
  title: "Admin Login - Order Content",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center ">
      <div className="flex-1 container py-8">
        <AdminLogin />
      </div>
    </main>
  );
}
