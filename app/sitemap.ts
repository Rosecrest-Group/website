import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rosecrestgroupltd.co.uk";

  return [
    // Core pages
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/faqs`, lastModified: new Date() },
    { url: `${baseUrl}/areas-we-cover`, lastModified: new Date() },
    { url: `${baseUrl}/request-inspection`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/cookie-policy`, lastModified: new Date() },
    { url: `${baseUrl}/thank-you`, lastModified: new Date() },

    // Sectors
    { url: `${baseUrl}/homebuyer`, lastModified: new Date() },
    { url: `${baseUrl}/homebuyer/survey-level-1`, lastModified: new Date() },
    { url: `${baseUrl}/homebuyer/survey-level-2`, lastModified: new Date() },
    { url: `${baseUrl}/homebuyer/survey-level-3`, lastModified: new Date() },
    { url: `${baseUrl}/landlord`, lastModified: new Date() },
    { url: `${baseUrl}/legal`, lastModified: new Date() },
    { url: `${baseUrl}/councils`, lastModified: new Date() },

    // Services hub
    { url: `${baseUrl}/services`, lastModified: new Date() },

    // Survey services
    { url: `${baseUrl}/services/damp-mould`, lastModified: new Date() },
    { url: `${baseUrl}/services/epc`, lastModified: new Date() },
    {
      url: `${baseUrl}/services/environmental-reports`,
      lastModified: new Date(),
    },
    { url: `${baseUrl}/services/party-wall`, lastModified: new Date() },
    {
      url: `${baseUrl}/services/party-wall/notice-generator`,
      lastModified: new Date(),
    },
    { url: `${baseUrl}/services/housing-disrepair`, lastModified: new Date() },
    { url: `${baseUrl}/services/cpr-35-reports`, lastModified: new Date() },
    { url: `${baseUrl}/services/stock-condition`, lastModified: new Date() },
    {
      url: `${baseUrl}/services/assocrics-mentoring`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/services/thermographic-surveys`,
      lastModified: new Date(),
    },

    // Trade services
    { url: `${baseUrl}/services/carpentry`, lastModified: new Date() },
    { url: `${baseUrl}/services/carpet-cleaning`, lastModified: new Date() },
    { url: `${baseUrl}/services/deep-cleaning`, lastModified: new Date() },
    { url: `${baseUrl}/services/handyman`, lastModified: new Date() },
    { url: `${baseUrl}/services/house-clearance`, lastModified: new Date() },
    {
      url: `${baseUrl}/services/painting-decorating`,
      lastModified: new Date(),
    },
    { url: `${baseUrl}/services/plastering`, lastModified: new Date() },
    { url: `${baseUrl}/services/plumbing`, lastModified: new Date() },
    { url: `${baseUrl}/services/tiling`, lastModified: new Date() },

  ];
}
