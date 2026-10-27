import DynamicClientWrapper from './DynamicClientWrapper';
import { endpoints } from '../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../Helpers/imageurl';
import { notFound } from 'next/navigation';
import {
  fetchCmsPageByUrlVariants,
  GetCanonicalUrl,
  getGeneralSettings,
  getWebsiteTitle,
  parseScrollDescription,
  resolveCmsStaticPageType,
} from '../../Helpers/metadata';
import ScriptInjector from '../../Components/common/ScriptInjector';

/** Fixed public URL — static UI, not in admin CMS. */
const STATIC_THANKYOU_PAGE_URL = 'thankyou.html';

function loadStaticThankyouPageResult() {
  return {
    type: 'cmsStatic',
    variant: 'thankyou',
    pageUrl: STATIC_THANKYOU_PAGE_URL,
    data: {
      pageData: {
        title: 'Thank You',
        browser_title: 'Thank You',
      },
    },
  };
}

function stripHtmlExt(slug) {
  return slug?.replace(/\.html$/i, '').replace(/\.htm$/i, '') ?? '';
}

function normSlug(value) {
  return String(value || '').toLowerCase();
}

function sanitizeTitle(str) {
  return str?.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '') ?? '';
}

/**
 * Exact admin identifiers only (slug / page_url / title slug).
 * Do not invent .html or flights-to- variants — mismatched URLs must 404.
 */
function getEntityAllowedSlugs(entity, sanitize = sanitizeTitle) {
  if (!entity) return new Set();
  const allowed = new Set();
  const add = (v) => {
    const n = normSlug(v);
    if (n) allowed.add(n);
  };
  add(entity.slug);
  add(entity.page_url);
  add(sanitize(entity.title));
  return allowed;
}

async function fetchMatchLocationOk(url) {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return data?.status === 1 ? data : null;
}

/** Fetch with the URL segment as-is — no slug candidate rewriting. */
async function resolveCountryBySlug(countrySegment) {
  if (!countrySegment) return null;
  const data = await fetchMatchLocationOk(endpoints.CountriesCitiesBySlug(countrySegment));
  if (!data) return null;
  const country = data.result?.country;
  if (!urlSegmentMatchesEntity(countrySegment, country)) return null;
  return { data: data.result, resolvedSlug: countrySegment };
}

async function resolveCityBySlug(citySegment) {
  if (!citySegment) return null;
  const data = await fetchMatchLocationOk(endpoints.CityFaresByCityName(citySegment));
  if (!data) return null;
  if (!urlSegmentMatchesEntity(citySegment, data.result)) return null;
  return { data: data.result, resolvedSlug: citySegment };
}

/** URL path segment must equal an admin field exactly (case-insensitive). */
function urlSegmentMatchesEntity(urlSegment, entity, sanitize = sanitizeTitle) {
  if (!entity || !urlSegment) return false;
  return getEntityAllowedSlugs(entity, sanitize).has(normSlug(urlSegment));
}

function continentSlugMatches(urlSlug, countryData, sanitize = sanitizeTitle) {
  return urlSegmentMatchesEntity(urlSlug, countryData?.continent, sanitize);
}

function countrySlugMatches(urlSlug, countryData, sanitize = sanitizeTitle) {
  return urlSegmentMatchesEntity(urlSlug, countryData, sanitize);
}

/** Continent, country, city destination slugs — exact admin/API match only. */
async function tryDestinationPage(slug) {
  const isFlightsTo = slug.startsWith('flights-to-');
  const isHolidaysTo = slug.startsWith('holidays-to-');

  if (isFlightsTo) {
    try {
      const continentRes = await fetch(endpoints.ContinentCountriesBySlug(slug), {
        next: { revalidate: 3600 },
      });
      const continentData = await continentRes.json();
      // API only succeeds for the exact admin continent slug (e.g. flights-to-africa, not .html)
      if (continentData.status === 1) {
        return { type: 'continent', data: continentData.result, continentSlug: slug };
      }
    } catch (e) {}

    const cityResult = await resolveCityBySlug(slug);
    if (cityResult) {
      return { type: 'city', data: cityResult.data, cityName: cityResult.resolvedSlug };
    }
    return null;
  }

  // Holiday country URLs (/holidays-to-indonesia.html etc.) disabled — re-enable later
  if (isHolidaysTo) {
    return null;
  }

  try {
    const continentRes = await fetch(endpoints.ContinentCountriesBySlug(slug), {
      next: { revalidate: 3600 },
    });
    const continentData = await continentRes.json();
    if (continentData.status === 1) {
      return { type: 'continent', data: continentData.result, continentSlug: slug };
    }
  } catch (e) {}

  return null;
}

async function loadCmsStaticPageResult(pageUrl) {
  const matched = await fetchCmsPageByUrlVariants(pageUrl);
  if (!matched) return null;

  const { pageData, resolvedUrl } = matched;
  const variant = resolveCmsStaticPageType(pageData);
  if (!variant) return null;

  if (variant === 'holidays') {
    const countriesRes = await fetch(endpoints.holidaysCountries, { next: { revalidate: 3600 } });
    const countriesData = await countriesRes.json();
    return {
      type: 'cmsStatic',
      variant,
      pageUrl: resolvedUrl,
      data: { holidayPage: pageData, countries: countriesData.data || [] },
    };
  }

  if (variant === 'continents') {
    const continentsRes = await fetch(endpoints.getContinents, { next: { revalidate: 3600 } });
    const continentsData = await continentsRes.json();
    return {
      type: 'cmsStatic',
      variant,
      pageUrl: resolvedUrl,
      data: {
        continents: continentsData.status === 1 ? continentsData.result.data : [],
        pageData,
        continentResponse: continentsData,
      },
    };
  }

  return {
    type: 'cmsStatic',
    variant,
    pageUrl: resolvedUrl,
    data: { pageData },
  };
}

async function getPageData(slugArr) {
  if (!slugArr) return null;
  const len = slugArr.length;
  const sanitize = sanitizeTitle;

  try {
    if (len >= 2 && slugArr[0] === 'holidays') {
      return null;
    }

    if (len === 1) {
      const s = slugArr[0];
      const base = stripHtmlExt(s);

      const destinationResult = await tryDestinationPage(s);
      if (destinationResult) return destinationResult;

      if (base === 'thankyou' || s === STATIC_THANKYOU_PAGE_URL) {
        return loadStaticThankyouPageResult();
      }

      if (s.includes('umrah') || base.includes('umrah')) {
        const matched = await fetchCmsPageByUrlVariants(s);
        if (matched) {
          return { type: 'umrahGeneral', data: matched.pageData, slug: matched.resolvedUrl };
        }
      }

      const cmsResult = await loadCmsStaticPageResult(s);
      if (cmsResult) return cmsResult;

      return null;
    }

    if (len === 2) {
      const [s1, s2] = slugArr;
      // Holiday package URLs under /holidays-to-*/... disabled — re-enable later
      if (s1.startsWith('holidays-to-')) {
        return null;
      }
      const countryResult = await resolveCountryBySlug(s2);
      if (countryResult) {
        const countryData = countryResult.data.country || {};
        if (
          urlSegmentMatchesEntity(s2, countryData, sanitize) &&
          continentSlugMatches(s1, countryData, sanitize)
        ) {
          return {
            type: 'country',
            data: countryResult.data,
            continentSlug: s1,
            countrySlug: s2,
          };
        }
      }
      return null;
    }

    if (len === 3) {
      const [s1, s2, s3] = slugArr;
      const cityResult = await resolveCityBySlug(s3);
      if (cityResult) {
        const cityData = cityResult.data;
        const countryData = cityData.country || {};
        if (
          urlSegmentMatchesEntity(s3, cityData, sanitize) &&
          countrySlugMatches(s2, countryData, sanitize) &&
          continentSlugMatches(s1, countryData, sanitize)
        ) {
          return {
            type: 'city',
            data: cityData,
            continentSlug: s1,
            countrySlug: s2,
            citySlug: s3,
          };
        }
      }
      return null;
    }
  } catch (err) {
    console.error("Error fetching dynamic page data:", err);
    return null;
  }

  return null;
}

function parseFaqIds(faqWidget) {
  const raw = faqWidget?.[0]?.faq_ids;
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !Number.isNaN(id));
}

async function fetchFaqsByIds(faqIds) {
  if (!faqIds.length) return null;
  try {
    const res = await fetch(endpoints.faqsId(faqIds.join(',')), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === 1 ? data.result.faqs : null;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return null;
  }
}

function getScrollDescriptionForResult(result) {
  const { type, data } = result;
  if (!data) return null;

  switch (type) {
    case 'city':
      return data.description;
    case 'country':
      return data.country?.description || data.description;
    case 'umrahGeneral':
      return data.scroll_description;
    case 'cmsStatic': {
      const pageData = data.holidayPage || data.pageData || data;
      return pageData?.scroll_description;
    }
    default:
      return null;
  }
}

/**
 * City `match-location` returns Economy fares.
 * `city-fares` default (no class / class=0) is Business; class=1 Premium; class=3 First.
 */
async function fetchCityFaresByClass(citySlug, classParam) {
  if (!citySlug) return null;
  try {
    const params = new URLSearchParams({
      slug: citySlug,
      page: '1',
      per_page: '12',
    });
    if (classParam !== undefined && classParam !== null) {
      params.set('class', String(classParam));
    }
    const res = await fetch(`${endpoints.cityFares}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status === 1 && data?.result?.fares) return data.result.fares;
  } catch (error) {
    console.error('Error fetching city fares:', error);
  }
  return null;
}

async function enrichPageResult(result) {
  if (!result?.data) return result;

  const enrichedData = { ...result.data };
  const scrollDescription = getScrollDescriptionForResult(result);

  if (scrollDescription) {
    enrichedData.parsedScrollContent = parseScrollDescription(scrollDescription);
  }

  if (result.type === 'city') {
    const scrollDescription2 = enrichedData.scroll_description_2;
    if (typeof scrollDescription2 === 'string' && scrollDescription2.trim()) {
      enrichedData.parsedScrollContent2 = parseScrollDescription(scrollDescription2);
    }

    // By default for city fares, fetch Economy / Premium class (class=1) instead of Business
    const defaultFares = await fetchCityFaresByClass(enrichedData.slug, 1);
    if (defaultFares && (defaultFares.data?.length > 0 || defaultFares.length > 0)) {
      enrichedData.fares = defaultFares;
    }
  }

  if (result.type === 'country') {
    const country = enrichedData.country || {};
    const scrollDescription2 = country.scroll_description_2 || enrichedData.scroll_description_2;
    if (typeof scrollDescription2 === 'string' && scrollDescription2.trim()) {
      enrichedData.parsedScrollContent2 = parseScrollDescription(scrollDescription2);
    }
  }

  const faqIds = parseFaqIds(
    enrichedData.faq_widget || enrichedData.country?.faq_widget
  );
  if (faqIds.length) {
    enrichedData.initialFaqs = await fetchFaqsByIds(faqIds);
  }

  return { ...result, data: enrichedData };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [result, generalSettings] = await Promise.all([
    getPageData(slug),
    getGeneralSettings()
  ]);
  const websiteTitle = getWebsiteTitle(generalSettings);
  
  if (!result) return { title: 'Page Not Found' };

  const { data, type, pageUrl: cmsPageUrl } = result;
  let pageTitle = '';
  let metaDesc = '';
  let metaKeywords = '';
  let imageUrl = '';
  let script = '';

  const canonicalPath = type === 'cmsStatic' && cmsPageUrl
    ? `/${cmsPageUrl}`
    : `/${slug.join('/')}`;
  const canonical = GetCanonicalUrl(canonicalPath);

  if (type === 'city') {
    pageTitle = data.browser_title || data.page_title;
    metaDesc = data.meta_description;
    metaKeywords = data.meta_keywords;
    script = data.script || data.page_script || data.contents?.script;
    imageUrl = data.banner_img?.[0]?.url ? `${BASE_URL_IMG}/${data.banner_img[0].url}` : '';
  } else if (type === 'continent') {
    const continentInfo = data.data?.[0]?.continent || {};
    pageTitle = continentInfo.browser_title || continentInfo.title;
    metaDesc = continentInfo.meta_description;
    metaKeywords = continentInfo.meta_keywords;
    script = continentInfo.script || continentInfo.page_script || continentInfo.contents?.script;
    imageUrl = continentInfo.images?.[0]?.url ? `${BASE_URL_IMG}/${continentInfo.images[0].url}` : '';
  } else if (type === 'country') {
    const countryData = data.country || {};
    pageTitle = countryData.browser_title || countryData.title;
    metaDesc = countryData.meta_description;
    metaKeywords = countryData.meta_keywords;
    script = countryData.script || countryData.page_script || countryData.contents?.script;
    imageUrl = countryData.images?.[0]?.url ? `${BASE_URL_IMG}/${countryData.images[0].url}` : '';
  } else if (type === 'holidaysCountry') {
    const countryData = Array.isArray(data) ? data[0] : data;
    pageTitle = `Holidays to ${countryData?.holiday_country_title || 'Destination'}`;
    metaDesc = countryData?.meta_description || "";
    script = countryData.script || countryData.page_script || countryData.contents?.script;
    imageUrl = countryData.images?.[0]?.url ? `${BASE_URL_IMG}/${countryData.images[0].url}` : '';
  } else if (type === 'holidayPackage') {
    pageTitle = data.title || 'Holiday Package';
    metaDesc = data.short_description || "";
    script = data.script || data.page_script || data.contents?.script;
    imageUrl = data.images?.[0]?.url ? `${BASE_URL_IMG}/${data.images[0].url}` : '';
  } else if (type === 'umrahGeneral') {
    pageTitle = data.browser_title || data.page_title;
    metaDesc = data.meta_description;
    metaKeywords = data.meta_keywords;
    script = data.script || data.page_script || data.contents?.script;
    imageUrl = data.banner_img?.[0]?.url ? `${BASE_URL_IMG}/${data.banner_img[0].url}` : '';
  } else if (type === 'cmsStatic') {
    const pageData = data.holidayPage || data.pageData || data;
    pageTitle = pageData.browser_title || pageData.title;
    metaDesc = pageData.meta_description || "";
    metaKeywords = pageData.meta_keywords || "";
    script = pageData.script || pageData.page_script || pageData.contents?.script;
    imageUrl = pageData.banner_img?.[0]?.url ? `${BASE_URL_IMG}/${pageData.banner_img[0].url}` : '';
  }

  const finalTitle = pageTitle || websiteTitle;

  return {
    title: finalTitle,
    description: metaDesc || "",
    keywords: metaKeywords || "",
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: finalTitle,
      description: metaDesc || "",
      url: canonical,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: metaDesc || "",
      images: imageUrl ? [imageUrl] : [],
    }
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const result = await enrichPageResult(await getPageData(slug));

  if (!result) {
    notFound();
  }

  const pagePayload = result.type === 'cmsStatic'
    ? (result.data.holidayPage || result.data.pageData || result.data)
    : result.data;
  const scriptContent = pagePayload?.script || pagePayload?.page_script || pagePayload?.contents?.script;

  return (
    <>
      <ScriptInjector scriptContent={scriptContent} />
      <DynamicClientWrapper result={result} params={params} />
    </>
  );
}

