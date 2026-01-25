
import { Navbar } from "@/components/layout/Navbar"
import { OrderForm } from "@/components/form/OrderForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 container py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Formulir Pesanan Konten</h1>
          <p className="text-muted-foreground">
            Silakan isi formulir di bawah ini dengan lengkap untuk mengajukan pesanan konten, publikasi event, atau kebutuhan media lainnya.
          </p>
        </div>
        <OrderForm />
      </div>
      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-white">
        <p>&copy; {new Date().getFullYear()} Student Organization Media Center.</p>
        <p className="mt-1">Built with Next.js & Supabase</p>
      </footer>
    </main>
  )
}
