import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "@/app/_context";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "WakeUp | Smart Alarm, Sleep and Weight Tracker",
  description: "Smart Alarm, Sleep and Weight Tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} max-w-[100%] overflow-x-clip`}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
