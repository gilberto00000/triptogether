import "./globals.css";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "@/components/QueryProvider";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display-face" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans-face" });

export const metadata = { title: "TripTogether", description: "Planeje viagens em grupo" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
