"use client";
import React from 'react';
import CityFlightFaresClient from './CityFlightFaresClient';
import CountryFaresClient from './CountryFaresClient';
import SpecificContinentClient from './SpecificContinentClient';
import CountryPackagesClient from './CountryPackagesClient';
import HolidayPackageDetailsClient from './HolidayPackageDetailsClient';
import UmrahGeneralClient from '../umrah/UmrahGeneralClient';
import AboutUsClient from '../about-us/AboutUsClient';
import AirlinesPageClient from '../airlines/AirlinesPageClient';
import HolidayPageClient from '../holidays/HolidayPageClient';
import ContactUsClient from '../contact-us/ContactUsClient';
import DestinationPageClient from '../continents/DestinationPageClient';
import PrivacyPolicyClient from '../privacy-policy/PrivacyPolicyClient';
import CookiesClient from '../cookies/CookiesClient';
import TermsConditionClient from '../terms-condition/TermsConditionClient';
import CustomerReviewsClient from '../customer-reviews/CustomerReviewsClient';
import ThankYouPageClient from '../thank-you/ThankYouPageClient';

function renderCmsStaticPage(variant, data, pageUrl) {
  switch (variant) {
    case 'airlines':
      return <AirlinesPageClient initialPageData={data.pageData} />;
    case 'holidays':
      return <HolidayPageClient initialData={data} />;
    case 'continents':
      return <DestinationPageClient initialData={data} />;
    case 'about-us':
      return <AboutUsClient initialData={data} />;
    case 'contact-us':
      return <ContactUsClient initialData={data.pageData} />;
    case 'customer-reviews':
      return <CustomerReviewsClient initialData={data.pageData} />;
    case 'thankyou':
      return <ThankYouPageClient />;
    case 'legal':
      if (pageUrl?.toLowerCase().includes('cookies')) {
        return <CookiesClient initialData={data.pageData} />;
      }
      if (pageUrl?.toLowerCase().includes('terms')) {
        return <TermsConditionClient initialData={data.pageData} />;
      }
      return <PrivacyPolicyClient initialData={data.pageData} />;
    default:
      return <PrivacyPolicyClient initialData={data.pageData} />;
  }
}

const DynamicClientWrapper = ({ result, params }) => {
  const { type, data, slug, variant, pageUrl } = result;

  switch (type) {
    case 'cmsStatic':
      return renderCmsStaticPage(variant, data, pageUrl);
    case 'city':
      return <CityFlightFaresClient initialData={data} params={params} />;
    case 'country':
      return <CountryFaresClient initialData={data} params={params} />;
    case 'continent':
      return <SpecificContinentClient initialData={data} params={params} />;
    case 'holidaysCountry':
      return <CountryPackagesClient initialData={data} countrySlug={params?.slug?.[0] ? params.slug[0].replace(/\.html$/i, '') : ''} />;
    case 'holidayPackage':
      return <HolidayPackageDetailsClient initialData={data} params={params} />;
    case 'umrahGeneral':
      return <UmrahGeneralClient initialData={data} slug={slug} />;
    default:
      return <div>Page type not supported yet: {type}</div>;
  }
};

export default DynamicClientWrapper;
