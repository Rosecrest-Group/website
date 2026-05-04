import { getPageMetadata } from "@/lib/page-metadata";
import HomebuyerClient from "./HomebuyerClient";

export const metadata = getPageMetadata("/homebuyer");

const Page = () => {
  return <HomebuyerClient />;
};

export default Page;
