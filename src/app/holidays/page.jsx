import HolidayPageClient from './HolidayPageClient';
import { endpoints } from '../../Helpers/endpoints';
import { notFound } from 'next/navigation';
import { fetchCmsPageByUrl, resolveCmsStaticPageType, GetCanonicalUrl } from '../../Helpers/metadata';
import ScriptInjector from '../../Components/common/ScriptInjector';

const HOLIDAYS_PAGE_URL = 'holidays.html';

async function getHolidaysPageData() {
  const pageData = await fetchCmsPageByUrl(HOLIDAYS_PAGE_URL);
  const countriesRes = await fetch(endpoints.holidaysCountries, { next: { revalidate: 3600 } });
  const countriesData = await countriesRes.json();
  const countries = countriesData.data || [];

  if (!countries.length && !pageData) return null;

  if (pageData && resolveCmsStaticPageType(pageData) === 'holidays') {
    return { holidayPage: pageData, countries };
  }

  return {
    holidayPage: pageData || {
      title: 'Holidays',
      browser_title: 'Holidays',
      description: '',
      widgets_content: '',
    },
    countries,
  };
}

export async function generateMetadata() {
  const data = await getHolidaysPageData();
  if (!data?.holidayPage) return { title: 'Page Not Found' };

  const { holidayPage } = data;
  const pageTitle = holidayPage.browser_title || holidayPage.title || 'Holidays';
  const metaDesc = holidayPage.meta_description || '';
  const canonical = GetCanonicalUrl(`/${HOLIDAYS_PAGE_URL}`);

  return {
    title: pageTitle,
    description: metaDesc,
    keywords: holidayPage.meta_keywords || '',
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: metaDesc,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDesc,
    },
  };
}

export default async function Page() {
  const data = await getHolidaysPageData();
  if (!data) notFound();

  const scriptContent =
    data.holidayPage?.script ||
    data.holidayPage?.page_script ||
    data.holidayPage?.contents?.script;

  return (
    <>
      <ScriptInjector scriptContent={scriptContent} />
      <HolidayPageClient initialData={data} />
    </>
  );
}