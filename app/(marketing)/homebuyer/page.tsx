import { getPageMetadata } from "@/lib/page-metadata";
import HomebuyerClient from "./HomebuyerClient";
import PageJsonLd from "@/components/common/PageJsonLd";

export const metadata = getPageMetadata("/homebuyer");

const Page = () => {
  return (
    <>
      <PageJsonLd path="/homebuyer" />
      <HomebuyerClient />
    </>
  );
};

export default Page;