"use client";
import React from "react";
import Link from "next/link";
import { resolveBlogUploadSrc, normalizeFrontendImageSrc, BASE_URL_IMG } from "../Helpers/imageurl";

function getImageUrl(url) {
  if (!url) return "";
  const cleanedUrl = normalizeFrontendImageSrc(resolveBlogUploadSrc(url));
  if (cleanedUrl.startsWith("/blog/wp-content/uploads")) return cleanedUrl;
  if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
    return cleanedUrl;
  }
  return `${BASE_URL_IMG}/media/${cleanedUrl.replace(/^\/+/, "")}`;
}

function formatBlogDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function BlogDetailTab({
  blog = [],
  heading = "Latest Posts",
  subheading = "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
}) {
  const posts = Array.isArray(blog) ? blog : blog?.data || [];

  if (!posts.length) return null;

  return (
    <aside>
      <div className="heading_section !pb-0 !mb-6">
        <h2 className="pre_heading !text-[28px] sm:!text-[32px] lg:!text-[36px] !mb-1">
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm sm:text-base text-[#4C4C4C] leading-relaxed">
            {subheading}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        {posts.map((post, idx) => {
          const href = post.page_url ? `/blog/${post.page_url}/` : "#";
          const dateLabel = formatBlogDate(post.publish_date);

          return (
            <>
              {idx > 0 && <div className="border-t border-[#D4D4D4] my-5 lg:my-[20px] xl:my-[40px]" />}
              <div
                key={post.id || post.page_url}
                className="flex gap-4 lg:gap-[20px] xl:gap-[24px] items-center"
              >
                <Link
                  href={href}
                  className="w-[120px] h-[80px] sm:w-[160px] sm:h-[100px] lg:w-[200px] lg:h-[112px] flex-shrink-0 overflow-hidden rounded-[16px]"
                >
                  <img
                    src={getImageUrl(post.image_url)}
                    alt={post.image_alt || post.title || ""}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <Link href={href}>
                    <h3
                      className="text-black text-[16px] sm:text-[18px] lg:text-[20px] xl:text-[24px] font-bold line-clamp-3 hover:text-grayText transition-colors leading-tight mb-2"
                      dangerouslySetInnerHTML={{ __html: post.title || "" }}
                    />
                  </Link>
                  <Link
                    href={href}
                    className="text-[#4C4C4C] text-[16px] lg:text-[16px] xl:text-[18px] font-bold hover:underline inline-flex items-center gap-2 "
                  >
                    Read More
                    <img
                      src="/media/fr-svgs/arrow-right.png"
                      className="w-[18px] h-[10px]"
                      alt=""
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </aside>
  );
}
