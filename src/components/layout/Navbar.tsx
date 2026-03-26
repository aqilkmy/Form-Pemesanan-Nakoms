import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            Nakoms Order
          </Link>
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/jadwal"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Jadwal
          </Link>
          <Link
            href="/monitoring"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Monitoring
          </Link>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button
              variant="default"
              className="rounded-full px-6 font-semibold shadow-sm"
            >
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
