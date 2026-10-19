import HolidayPackageDetailsClient from '../../../../[...slug]/HolidayPackageDetailsClient';
import { endpoints } from '../../../../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../../../../Helpers/imageurl';
import { notFound } from 'next/navigation';
import { GetCanonicalUrl } from '../../../../../Helpers/metadata';
import { ensureHtmlExt, stripHtmlExt } from '../../../../../Helpers/holidayUrls';
import ScriptInjector from '../../../../../Components/common/ScriptInjector';

async function getPackageData(packageSlug) {
  const slug = ensureHtmlExt(packageSlug);
  try {
    const res = await fetch(endpoints.holidayPackageDetailsBySlug(slug), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const packageData = Array.isArray(data) ? data[0] : data?.data?.[0] || data?.data || data;
    return packageData && Object.keys(packageData).length ? packageData : null;
  } catch (err) {
    console.error('Error fetching holiday package:', err);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { countrySlug, citySlug, packageSlug } = await params;
  const packageData = await getPackageData(packageSlug);
  if (!packageData) return { title: 'Page Not Found' };

  const pageTitle = packageData.browser_title || packageData.title || 'Holiday Package';
  const metaDesc = packageData.meta_description || packageData.short_description || '';
  const imageUrl = packageData.banner_img?.[0]?.url
    ? `${BASE_URL_IMG}/${packageData.banner_img[0].url}`
    : '';
  const canonical = GetCanonicalUrl(
    `/holidays/${stripHtmlExt(countrySlug)}/${stripHtmlExt(citySlug)}/${ensureHtmlExt(packageSlug)}`
  );

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: packageData.meta_keywords || '',
    alternates: { canonical },
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
    },
  };
}

export default async function Page({ params }) {
  const { countrySlug, citySlug, packageSlug } = await params;
  const packageData = await getPackageData(packageSlug);

  if (!packageData) notFound();

  const scriptContent =
    packageData.script ||
    packageData.page_script ||
    packageData.contents?.script;

  return (
    <>
      <ScriptInjector scriptContent={scriptContent} />
      <HolidayPackageDetailsClient
        initialData={packageData}
        countrySlug={countrySlug}
        citySlug={citySlug}
        packageSlug={packageSlug}
      />
    </>
  );
}