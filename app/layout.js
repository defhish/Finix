import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";

//way to import a font
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finix",
  description: "Track Your finances the Smart Way",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-50`}>
          {/* header */}
          <Header />

          <main className="min-h-screen">{children}</main>

          <Toaster richColors />

          {/* footer */}
          <footer className="bg-gray-50 py-6 mt-12 border-t">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-[#06b6d4]">Finix</span>. All
                rights reserved.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
