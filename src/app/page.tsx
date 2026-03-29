import { OrderForm } from "@/components/form/OrderForm";

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
        </div>
        <OrderForm />
      </div>
    </main>
  );
}
