
import Link from "next/link"

export function Navbar() {
    return (
        <nav className="w-full bg-primary text-primary-foreground shadow-md">
            <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    Form Pemesanan Konten
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/" className="hover:underline opacity-90 hover:opacity-100">
                            Home
                        </Link>
                        <Link href="/monitoring" className="hover:underline opacity-90 hover:opacity-100">
                            Monitoring
                        </Link>
                        <Link href="/admin" className="hover:underline opacity-90 hover:opacity-100">
                            Admin
                        </Link>
                    </div>
                    {/* <div className="text-sm font-light opacity-90">
                        BEM Unsoed 2026 | Riset dan Media
                    </div> */}
                </div>
            </div>
        </nav>
    )
}
