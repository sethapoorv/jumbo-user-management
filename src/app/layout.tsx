import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export const metadata = {
  title: "Jumbo User Management",
  description: "Assignment App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
