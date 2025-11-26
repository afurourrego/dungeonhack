import type { Metadata } from "next";
import "@/styles/globals.css";
import "@mysten/dapp-kit/dist/index.css";
import { Press_Start_2P } from "next/font/google";
import { Providers } from "@/components/Providers";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dungeon Flip Lite - Web3 Roguelite on OneChain",
  description: "A mini roguelite game built for OneHack 2.0 hackathon featuring NFTs, tokens, and on-chain progress tracking on OneChain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pressStart.className} min-h-screen bg-dungeon-dark text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
