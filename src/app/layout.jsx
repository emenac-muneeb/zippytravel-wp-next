import { Inter } from "next/font/google";
import "../index.css";
import { GeneralSettingsProvider } from "../Context/GeneralSettingsContext";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import WhatsAppButton from "../Components/WhatsAppButton";
import ScrollToTop from "../Components/ScrollToTop";
import TopLoadingBar from "../Components/common/TopLoadingBar";
import { Suspense } from "react";
import Script from "next/script";
import { getGeneralSettings, getWebsiteTitle, getRobotsSetting, GetCanonicalUrl } from "../Helpers/metadata";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import ScriptInjector from "../Components/common/ScriptInjector"; 
import ToastProvider from "../Components/common/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  // Fewer files = less competition with the hero LCP image (keep light + regular + bold)
  weight: ["300", "400", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const SITE_VERIFICATION = {
  google: "rvH27akGIDYg099xbHVi6AZ4l3AbZasD3t4L9GRt2nY",
  other: {
    "msvalidate.01": "1E08BF7CB9A471BFCFD2C3FAB265B816",
    "facebook-domain-verification": "iinborugb2ih0emq7tup6mr67qa6ml",
  },
};

export async function generateMetadata() {
  const result = await getGeneralSettings();
  const websiteTitle = getWebsiteTitle(result);
  const robots = getRobotsSetting(result);

  if (!result) {
    return {
      verification: SITE_VERIFICATION,
      ...(robots ? { robots } : {}),
    };
  }

  const { settings } = result;

  // Favicon logic
  const logoSetting = settings.find((s) => s.ref_name === "Website Logo");
  const faviconPath = logoSetting?.contents?.favicon;
  const icons = faviconPath ? { icon: `${BASE_URL_IMG}${faviconPath}` } : undefined;

  return {
    title: {
      default: websiteTitle,
      template: `%s | ${websiteTitle}`,
    },
    description: "",
    verification: SITE_VERIFICATION,
    icons,
    ...(robots ? { robots } : {}),
    openGraph: {
      title: websiteTitle,
      description: "",
      url: GetCanonicalUrl("/"),
      siteName: websiteTitle,
      images: [
        {
          url: `${BASE_URL_IMG}/images/og-image.png`, // Fallback OG image
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: websiteTitle,
      description: "",
      images: [`${BASE_URL_IMG}/images/og-image.png`],
    },
  };
}


export default async function RootLayout({ children }) {
  const result = await getGeneralSettings();
  const settings = result?.settings || [];

  // Scripts from General Settings
  const analyticsSetting = settings.find((s) =>
    s.ref_name.toLowerCase().includes("google analytics")
  );

  const seoHeaderSetting = settings.find(
    (item) => item.ref_name === "SEO Meta Tags in Header" && item.is_active
  );

  const seoBodySetting = settings.find(
    (item) =>
      item.ref_name === "SEO Tracking or Other Scripts in the End of Body Tag" &&
      item.is_active
  );


  return (
    <html lang="en" className={inter.variable}>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            id="dev-third-party-guard"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(){window._smartsupp=window._smartsupp||{};window.SMARTSUPP_AUTOCREATE=false;if(typeof window.smartsupp!=="function"){window.smartsupp=function(){(window.smartsupp.q=window.smartsupp.q||[]).push(arguments);};window.smartsupp.q=[];}var blocked=/smartsuppchat\\.com\\/loader\\.js|register\\.feefo\\.com|feefo-widget/i;function removeBlockedScript(node){if(node&&node.tagName==="SCRIPT"&&node.src&&blocked.test(node.src)){node.remove();return true;}return false;}new MutationObserver(function(mutations){mutations.forEach(function(mutation){mutation.addedNodes.forEach(function(node){if(node.nodeType!==1)return;if(removeBlockedScript(node))return;if(node.querySelectorAll){node.querySelectorAll("script[src]").forEach(removeBlockedScript);}});});}).observe(document.documentElement,{childList:true,subtree:true});})();`,
            }}
          />
        )}
        {/* Render header scripts and analytics scripts in the head tag */}
        <ScriptInjector scriptContent={seoHeaderSetting?.contents} strategy="afterInteractive" target="head" />
        <ScriptInjector scriptContent={analyticsSetting?.is_active ? analyticsSetting.contents : null} strategy="afterInteractive" target="head" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GeneralSettingsProvider initialResult={result}>
          <Suspense>
            <TopLoadingBar />
          </Suspense>
          <WhatsAppButton />
          <ScrollToTop />
          <NavBar />
          <ToastProvider />
          <main>{children}</main>
          <Footer />
        </GeneralSettingsProvider>

        {/* Render body scripts at the end of body */}
        <ScriptInjector scriptContent={seoBodySetting?.contents} strategy="lazyOnload" target="body" />
      </body>
    </html>
  );
}


