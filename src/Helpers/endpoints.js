import { BASE_URL, WP_URL } from "./apiHelper";

const endpoints = {
  signUp: `${BASE_URL}/customer/register`,
  login: `${BASE_URL}/customer/login`,
  verifyCode: `${BASE_URL}/verify-code`,
  resendOtp: `${BASE_URL}/customer/resend-code`,
  generalSettings: `${BASE_URL}/general-setting`,

  //countries
  cityFares: `${BASE_URL}/city-fares`,
  holidaysCountries: `${BASE_URL}/holiday`,
  holidaysCountryDetailsBySlug: (holiday_country_slug) =>
    `${BASE_URL}/holiday?holiday_country_id=${holiday_country_slug}`,
  holidaysCityDetailsBySlug: (holiday_city_slug) =>
    `${BASE_URL}/holiday?holiday_city_id=${holiday_city_slug}`,
  holidayPackageDetailsBySlug: (holiday_package_slug) =>
    `${BASE_URL}/holiday?holiday_package_id=${holiday_package_slug}`,

  // continents
  getContinents: `${BASE_URL}/match-location`,
  CityFaresByCityName: (cityName) =>
    `${BASE_URL}/match-location?city_name=${encodeURIComponent(cityName)}`,
  ContinentCountriesBySlug: (slug) =>
    `${BASE_URL}/match-location?continent_id=${encodeURIComponent(slug)}`,
  CountriesCitiesBySlug: (slug) =>
    `${BASE_URL}/match-location?country_id=${encodeURIComponent(slug)}`,

  // FAQS
  faqs: `${BASE_URL}/faqs`,
  faqsId: (faq_ids) => `${BASE_URL}/get-faqs?faq_ids=${faq_ids}`,

  // umrah?Type
  umrahType: `${BASE_URL}/umrah-type`,
  umrahDetailById: (umrah_slug) => `${BASE_URL}/umrah-type?(umrah_slug)`,
  umrahPackageByNight: (umrah_night) =>
    `${BASE_URL}/umrah-type?package_night=${umrah_night}`,

  //  Home Banner
  banner: `${BASE_URL}/banner`,
  termsConditions: `${BASE_URL}/get-page`,
  aboutUs: `${BASE_URL}/get-page`,
  privacyPolicy: `${BASE_URL}/get-page`,
  cookiesPolicy: `${BASE_URL}/get-page`,

  //send email
  sendEmail: `${BASE_URL}/send-email`,
  // reviews
  reviews: `${BASE_URL}/reviews`,
  reviewsByPackageId: (package_id) =>
    `${BASE_URL}/reviews?package_id=${package_id}`,

  //get page
  getPage: `${BASE_URL}/get-page`,
  reviews: `${BASE_URL}/reviews`,

  //airlines
  airlines: `${BASE_URL}/airline`,
  airlineDetails: (airlineSlug) => `${BASE_URL}/airline?slug=${airlineSlug}`,
  allBlogs: (page) => `${WP_URL}?per_page=12&page=${page}`,
  blogs:`${WP_URL}?per_page=10&page=1`,
  blogDetail: (slug) => `${WP_URL}?slug=${slug}`,
  featuredBlogs:`${WP_URL}?categories=2&per_page=10`,

};




export { endpoints };
