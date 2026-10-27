import "./(marketing)/marketing.css";
import MarketingSiteChrome from "@/components/layout/MarketingSiteChrome";
import MarketingNotFound from "./(marketing)/not-found";

export { metadata } from "./(marketing)/not-found";

// Unmatched URLs render here, outside the (marketing) layout, so the site
// styles and navbar have to be brought in explicitly.
export default function NotFound() {
  return (
    <MarketingSiteChrome>
      <MarketingNotFound />
    </MarketingSiteChrome>
  );
}
