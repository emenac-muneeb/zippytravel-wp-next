"use client";
import React from "react";
import dynamic from "next/dynamic";
import BlogHeroSection from "../../../Components/BlogHeroSection";
import BlogDetailTab from "../../../Components/BlogDetailTab";
import { rewriteBlogUploadUrlsInHtml } from "../../../Helpers/imageurl";
import { FaqSectionSkeleton } from "../../../Components/common/Skeleton";
import "../../../ExternalCSS/blog.css";

const FaqSection = dynamic(
  () => import("../../../Components/FaqSection"),
  {
    ssr: false,
    loading: () => <FaqSectionSkeleton />,
  }
);

export default function BlogDetailClient({ initialData }) {
  const { blogPage, latestBlog } = initialData;

  const allBanners = React.useMemo(() => {
    const bannerImg = blogPage?.banner_img;
    if (!bannerImg) return [];
    if (!Array.isArray(bannerImg) && bannerImg.banner_image_url) {
      return [
        {
          url: bannerImg.banner_image_url,
          title: bannerImg.banner_image_title || "",
          alt: bannerImg.banner_image_alt || "",
        },
      ];
    }
    if (Array.isArray(bannerImg)) {
      return bannerImg.map((item) => ({
        url: item.url || item.banner_image_url || "",
        title: item.title || item.banner_image_title || "",
        alt: item.alt || item.banner_image_alt || "",
      }));
    }
    return [];
  }, [blogPage]);

  const fallbackImage = blogPage?.image_url || "";

  return (
    <div className="w-full bg-white">
      <BlogHeroSection
        banners={allBanners}
        title={blogPage?.title}
        fallbackImage={fallbackImage}
      />

      <section className="pb-[40px] sm:pb-[60px]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_478px] xl:grid-cols-[1fr_648px] gap-[20px] lg:gap-[24px] xl:gap-[24px] items-start">
            <div className="min-w-0">
              <div
                className="parseData blog-detail-content"
                dangerouslySetInnerHTML={{
                  __html: rewriteBlogUploadUrlsInHtml(
                    blogPage?.description || ""
                  ),
                }}
              />

             
            </div>

            <div className="lg:sticky lg:top-24">
              <BlogDetailTab blog={latestBlog} heading="Latest Posts" />
            </div>
          </div>

          
        </div>
      </section>
      {blogPage?.faq_widget?.[0]?.faq_ids && (
            <div className="pt-0 lg:pt-[0px] block">
              <FaqSection
                faq_ids={blogPage.faq_widget[0].faq_ids
                  .split(",")
                  .map(Number)}
                heading={blogPage.faq_widget[0]?.heading || ""}
                subheading={blogPage.faq_widget[0]?.sub_heading || ""}
              />
            </div>
      )}
    </div>
  );
}
