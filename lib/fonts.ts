import { Manrope, Source_Sans_3 } from "next/font/google";

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});
