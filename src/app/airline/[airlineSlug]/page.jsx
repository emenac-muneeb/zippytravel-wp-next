import AirlinesDetailsClient from './AirlinesDetailsClient';
import { endpoints } from '../../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../../Helpers/imageurl';
import { notFound } from 'next/navigation';
import ScriptInjector from '../../../Components/common/ScriptInjector';

async function getAirlineDetails(slug) {
  try {
    const url = endpoints.airlineDetails(slug);
    console.log("[DEBUG getAirlineDetails] Fetching URL:", url);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    console.log("[DEBUG getAirlineDetails] Response status:", res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log("[DEBUG getAirlineDetails] Data status:", data?.status, "result:", !!data?.result);
    return data?.status === 1 ? data.result : null;
  } catch (err) {
    console.error("Error fetching airline details:", err);
    return null;
  }
}

import { GetCanonicalUrl } from '../../../Helpers/metadata';

// ... (getAirlineDetails function remains same)

export async function generateMetadata({ params }) {
  const { airlineSlug } = await params;
  const airlineData = await getAirlineDetails(airlineSlug);
  
  if (!airlineData) return { title: 'Airline Not Found' };

  const pageTitle = airlineData.browser_title || airlineData.title;
  const metaDesc = airlineData.meta_description || "";
  const imageUrl = airlineData.banner_img?.[0]?.url 
    ? `${BASE_URL_IMG}/${airlineData.banner_img[0].url}` 
    : '';
  const canonical = GetCanonicalUrl(`/airline/${airlineSlug}`);

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: airlineData.meta_keywords || "",
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: pageTitle,
      description: metaDesc,
      url: canonical,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDesc,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}


export default async function Page({ params }) {
  const resolvedParams = await params;
  console.log("[DEBUG Page] resolvedParams:", resolvedParams);
  const { airlineSlug } = resolvedParams;
  const airlineData = await getAirlineDetails(airlineSlug);

  if (!airlineData) {
    console.log("[DEBUG Page] airlineData is null, calling notFound()");
    notFound();
  }

  return (
    <>
      <ScriptInjector scriptContent={airlineData?.script} />
      <AirlinesDetailsClient initialAirlineData={airlineData} airlineSlug={airlineSlug} />
    </>
  );
}
