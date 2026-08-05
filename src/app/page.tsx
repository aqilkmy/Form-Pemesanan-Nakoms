import { OrderForm } from "@/components/form/OrderForm";
import Link from "next/link";
import { Users2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 container py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Formulir Pemesanan Rizzmed
          </h1>
          <p className="text-muted-foreground">
            Silakan isi formulir di bawah ini dengan sadar untuk mengajukan
            pesanan desain, publikasi, website, bantuan teknis, atau survey.
          </p>
          <div className="pt-3">
            <Link href="/pj">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold gradient-secondary text-white shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200">
                <Users2 className="w-4 h-4" />
                Lihat PJ
              </button>
            </Link>
          </div>
        </div>
        <OrderForm />
      </div>
    </main>
  );
}
