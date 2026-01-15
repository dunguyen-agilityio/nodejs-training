import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
            <CartProvider>
              <header className="flex justify-between items-center p-4 h-16 border-b bg-background">
                <Link href="/" className="font-bold text-xl">
                  MyStore
                </Link>
                <div className="flex items-center gap-4">
                  <Link href="/cart" className="relative p-2 hover:bg-accent rounded-md">
                    🛒
                  </Link>
                  <SignedIn>
                    <Link href="/orders" className="text-sm font-medium hover:underline">
                      Orders
                    </Link>
                  </SignedIn>
                  <Link href="/admin" className="text-sm font-medium hover:underline">
                    Admin
                  </Link>
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
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
