import { Figtree, Inter, Manrope, Schibsted_Grotesk, Source_Sans_3 } from "next/font/google";

// Marketing site typefaces: Schibsted Grotesk for headings, Figtree for body copy.
export const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-schibsted",
});

export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
});

/** Put on the marketing wrapper, and on anything portalled out of it (dialogs, sheets). */
export const siteFontClass = `rc-site ${schibstedGrotesk.variable} ${figtree.variable}`;

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});
