import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";


const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: "KareerKami - Your AI Career Coach",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${inter.className} bg-background text-foreground antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            {/* header */}
            <Header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60" />
            <nav>
              <Link href="/" className="text-blue-500 hover:underline">
              <Image src="/logo.png" alt="KareerKami Logo" width={200} height ={60} 
              className="h-20 py-1 w-auto object-contain" />
                </Link>
                <div>
                  <SignedIn>
                    <Link href = {'/dashboard'}>
                    <Button>
                      <LayoutDashboard className="h-4 w-4" />
                      Industry Insights
                    </Button>
                    </Link>
                  </SignedIn>
                </div>
            </nav>
            <main className="min-h-screen">{children}</main>
            
            {/* footer*/}
            <footer className="bg-muted py-12 text-center">
              <div className="container mx-auto px-4 texte-center text-gray-200">
                <p>Made by Kashish Rajput</p>
              </div>
            </footer>
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
