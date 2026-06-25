import MarketingSiteChrome from "@/components/layout/MarketingSiteChrome";
import "./marketing.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingSiteChrome>{children}</MarketingSiteChrome>;
}
