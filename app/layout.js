import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { dark } from "@clerk/themes";


const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: "KareerKami - Your AI Career Coach",
  description: " ",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      baseTheme:dark,
    }}>
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
            <Header />
            
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
