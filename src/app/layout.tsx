import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
export const metadata = { title: "TripTogether", description: "Planeje viagens em grupo" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body><QueryProvider>{children}</QueryProvider></body></html>; }
