import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "./providers";
import "./globals.css";

const geistSans = Geist( {
  variable: "--font-geist-sans",
  subsets: [ "latin" ],
} );

const geistMono = Geist_Mono( {
  variable: "--font-geist-mono",
  subsets: [ "latin" ],
} );

export const metadata: Metadata = {
  title: "America Europe Shop",
  description: "America Europe Shop — це сервіс, який допомагає легко та безпечно замовляти товари з популярних інтернет-магазинів Європи та США. Ми знаходимо вигідні пропозиції, акції та знижки, щоб ви могли купувати брендові речі за найкращими цінами.",
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="uk">
      <body
        className={`${ geistSans.variable } ${ geistMono.variable } antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
