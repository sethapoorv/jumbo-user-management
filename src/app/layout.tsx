import Navbar from "@/components/navbar/NavBar";
import "./globals.css";
import QueryProvider from "@/components/providers/ReactQueryProvider";
import ActivityLog from "@/components/activity/ActivityLog";

export const metadata = { title: "App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen transition-colors bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <Navbar />
        <QueryProvider>
          {children}
          <ActivityLog />
        </QueryProvider>
      </body>
    </html>
  );
}
