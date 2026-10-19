"use client";
import React from "react";
import { BASE_URL_IMG, normalizeFrontendImageSrc, resolveBlogUploadSrc } from "../Helpers/imageurl";

function getBannerUrl(url) {
  if (!url) return "";
  const cleanedUrl = normalizeFrontendImageSrc(resolveBlogUploadSrc(url));
  if (cleanedUrl.startsWith("/blog/wp-content/uploads")) return cleanedUrl;
  if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
    return cleanedUrl;
  }
  return `${BASE_URL_IMG}/media/${cleanedUrl.replace(/^\/+/, "")}`;
}

export default function BlogHeroSection({
  banners = [],
  title = "",
  fallbackImage = "",
}) {
  const bannerList = React.useMemo(() => {
    if (!banners) return [];

    if (!Array.isArray(banners) && banners.banner_image_url) {
      return [
        {
          url: banners.banner_image_url,
          title: banners.banner_image_title || "",
          alt: banners.banner_image_alt || "",
        },
      ];
    }

    if (Array.isArray(banners)) {
      return banners.map((item) => ({
        url: item.url || item.banner_image_url || "",
        title: item.title || item.banner_image_title || "",
        alt: item.alt || item.banner_image_alt || "",
      }));
    }

    return [];
  }, [banners]);

  const imageUrl =
    getBannerUrl(bannerList[0]?.url || "") || getBannerUrl(fallbackImage);
  const imageAlt = bannerList[0]?.alt || title || "Blog Banner";

  if (!imageUrl && !title) return null;

  return (
    <section className="pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[40px] lg:pb-[60px]">
      <div className="relative">
        <div className=" w-full lg:max-w-[1620px] pr-[20px] pl-[20px] lg:pl-[0px] lg:pr-[24px] xl:pr-[30px]">
          <div className="relative">
            {imageUrl && (
              <div className="w-full lg:w-[768px] xl:w-[992px] xxl:w-[1060px] overflow-hidden rounded-[16px]">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  title={bannerList[0]?.title || ""}
                  loading="eager"
                  decoding="async"
                  className="w-full h-[240px] sm:h-[430px] lg:h-[480px] xl:h-[596px] object-cover rounded-[16px]"
                />
              </div>
            )}

            {title && (
              <div
                className={`w-full lg:w-[548px] xl:w-[648px] bg-white border border-[#EB9448] rounded-[15px] px-[30px] lg:px-[30px] xl:px-[52px] 
                  py-[24px] lg:py-[30px] xl:py-[52px]
                  ${
                    imageUrl
                      ? "mt-[-30px] z-10 lg:mt-0 relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:shadow-sm"
                      : ""
                  }`}
              >
                <h1
                  className="text-[22px] sm:text-[22px] lg:text-[26px] xl:text-[38px] font-bold text-black leading-tight"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
