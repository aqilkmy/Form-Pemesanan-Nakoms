"use client";

import Link from "next/link";
import { Menu, Home, Calendar, LayoutDashboard, User } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Home", url: "/", icon: <Home className="size-5 shrink-0" /> },
  {
    title: "Jadwal",
    url: "/jadwal",
    icon: <Calendar className="size-5 shrink-0" />,
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: <LayoutDashboard className="size-5 shrink-0" />,
  },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <div className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
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
              <span className="text-lg font-bold tracking-tight">
                Nakoms Order
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.url}
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors  hover:text-accent-foreground"
                      >
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}{" "}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button className="rounded-full px-2 font-semibold shadow-sm">
                <User className="size-4 mr-1" /> Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
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
              <span className="text-lg font-bold tracking-tight">
                Nakoms Order
              </span>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <Link href="/" className="flex items-center gap-2">
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
                      <span className="text-lg font-bold tracking-tight">
                        Nakoms Order
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4 mt-8">
                  <div className="flex flex-col gap-4">
                    {menuItems.map((item) => (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="flex items-center gap-4 text-md font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted"
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <Link href="/admin">
                      <Button className="w-full justify-start font-semibold rounded-lg shadow-sm">
                        <User className="size-5 mr-3" /> Admin
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
