import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Personal Chat",
  description: "Your private, AI-powered personal chat experience",
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        <div className="fixed -top-32 -left-32 w-96 h-96 bg-blue-900 opacity-15 rounded-full blur-3xl z-0" />
        <div className="fixed -bottom-40 right-0 w-96 h-96 bg-purple-900 opacity-10 rounded-full blur-3xl z-0" />
        <div className="fixed top-1/2 left-1/2 w-[600px] h-[300px] bg-blue-950 opacity-10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 z-0" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
