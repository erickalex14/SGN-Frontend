import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "SGN", template: "%s | SGN" }, description: "Sistema de Gestión Novicompu" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" /><link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet" /></head><body>{children}</body></html>; }