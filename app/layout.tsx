// app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// বাংলা ও ইংরেজির জন্য চমৎকার একটি গুগল ফন্ট
const notoSansBengali = Noto_Sans_Bengali({ 
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EduNex BD | College Management System",
  description: "A professional system for managing college operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      {/* 👇 এখানে suppressHydrationWarning={true} যোগ করা হয়েছে */}
      <body suppressHydrationWarning={true} className={`${notoSansBengali.className} bg-slate-50 text-slate-800`}>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          
          <Sidebar />
          
          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
            <Header />
            
            {/* main-কে flex-1 দেওয়া হলো যাতে সে স্ক্রল না করেই পুরো জায়গা নেয় */}
            <main className="p-6 sm:p-10 flex-1 flex flex-col">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}