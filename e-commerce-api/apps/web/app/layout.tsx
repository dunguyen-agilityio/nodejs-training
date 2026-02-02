import { type Metadata } from "next";
import {
  ClerkProvider,
  OrganizationSwitcher,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import QueryProvider from "@/context/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";
import { Toaster } from "sonner";
import { get } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Built with Next.js and Clerk",
};

import { CartItem } from "@/lib/types";
import { getCarts } from "@/lib/cart";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated } = await auth();

  let cart: CartItem[] = [];
  if (isAuthenticated) {
    try {
      cart = await getCarts();
    } catch (error) {
      console.error("Failed to fetch cart on server:", error);
      // Handle error gracefully, maybe show a toast on the client
    }
  }

  return (
    <ClerkProvider afterSignOutUrl="/sign-out">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <CartProvider initialCart={cart}>
                <header className="flex justify-between items-center p-4 h-16 border-b bg-background">
                  <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-xl">
                      MyStore
                    </Link>
                    <OrganizationSwitcher hidePersonal />
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/cart"
                      className="relative p-2 hover:bg-accent rounded-md"
                    >
                      🛒
                    </Link>
                    <SignedIn>
                      <Link
                        href="/orders"
                        className="text-sm font-medium hover:underline"
                      >
                        Orders
                      </Link>
                    </SignedIn>

                    <ModeToggle />
                    <SignedOut>
                      <SignInButton mode="modal" />
                      <SignUpButton mode="modal">
                        <button className="bg-primary text-primary-foreground rounded-full font-medium text-sm h-10 px-4 cursor-pointer hover:bg-primary/90">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </div>
                </header>
                {children}
                <Toaster />
              </CartProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
