"use client";
import React from "react";
import Link from "next/link";
import { BASE_URL_IMG, normalizeFrontendImageSrc, resolveBlogUploadSrc } from "../Helpers/imageurl";

export function getBlogImageUrl(url) {
  if (!url) return "";
  const cleanedUrl = normalizeFrontendImageSrc(resolveBlogUploadSrc(url));
  if (cleanedUrl.startsWith("/blog/wp-content/uploads")) return cleanedUrl;
  if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
    return cleanedUrl;
  }
  return `${BASE_URL_IMG}/media/${cleanedUrl.replace(/^\/+/, "")}`;
}

export function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function ReadMoreLink({ href, className = "" }) {
  return (
    <Link
      href={href}
      className={`text-[#4C4C4C] text-[16px] sm:text-[18px] font-bold hover:underline inline-flex items-center gap-2 ${className}`}
    >
      Read More
      <img
        src="/media/fr-svgs/arrow-right.png"
        className="w-[21px] h-[12px] inline-block"
        alt=""
        aria-hidden
      />
    </Link>
  );
}

function resolvePostHref(post, href) {
  if (href) return href;
  if (post?.page_url) return `/blog/${post.page_url}/`;
  if (post?.href) return post.href;
  return "#";
}

function LargePost({ post, href }) {
  if (!post) return null;
  const link = resolvePostHref(post, href);
  const excerpt = stripHtml(
    post.short_description || post.banner_description || post.description || ""
  );
  const imageSrc = post.large_thumbnail_url?.startsWith("/")
    ? post.large_thumbnail_url
    : getBlogImageUrl(post.large_thumbnail_url);

  return (
    <article className="flex flex-col">
      <Link href={link} className="block overflow-hidden rounded-[16px] mb-[16px]">
        <img
          src={imageSrc}
          alt={post.image_alt || post.title || ""}
          className="w-full h-[240px] sm:h-[320px] lg:h-[364px] object-cover rounded-[16px]"
        />
      </Link>
      <Link href={link}>
        <h3 className="text-[20px] sm:text-[24px] font-bold text-black hover:text-grayText transition-colors leading-tight mb-1 line-clamp-3">
          {post.title}
        </h3>
      </Link>
      {excerpt && (
        <p className="text-sm sm:text-[18px] text-[#4C4C4C] line-clamp-2 mb-3 leading-tight">
          {excerpt}
        </p>
      )}
      <ReadMoreLink href={link} />
    </article>
  );
}

export function BlogListCard({ post }) {
  if (!post) return null;
  const link = resolvePostHref(post);
  const imageSrc = post.image_url?.startsWith("/")
    ? post.image_url
    : getBlogImageUrl(post.image_url);

  return (
    <div className="flex gap-4 sm:gap-[24px] items-center">
      <Link
        href={link}
        className="w-[120px] h-[80px] sm:w-[160px] sm:h-[100px] lg:w-[200px] lg:h-[112px] flex-shrink-0 overflow-hidden rounded-[16px]"
      >
        <img
          src={imageSrc}
          alt={post.image_alt || post.title || ""}
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <Link href={link}>
          <h4 className="text-black text-[16px] sm:text-[18px] lg:text-[24px] font-bold line-clamp-3 hover:text-grayText transition-colors leading-tight mb-2">
            {post.title}
          </h4>
        </Link>
        <ReadMoreLink href={link} />
      </div>
    </div>
  );
}

function ListPosts({ posts }) {
  if (!posts?.length) return null;

  return (
    <div className="flex flex-col">
      {posts.map((post, idx) => (
        <div key={post.id || post.title || idx}>
          {idx > 0 && <div className="border-t border-[#D4D4D4] my-5 sm:my-[40px]" />}
          <BlogListCard post={post} />
        </div>
      ))}
    </div>
  );
}

/**
 * Featured-style: large left + list right
 * Latest-style: list left + large right (mirror)
 */
export default function BlogPostsSection({
  heading,
  subheading,
  posts = [],
  seeAllHref = "/blog/",
  showSeeAll = true,
  mirror = false,
}) {
  const featuredPost = posts[0];
  const otherPosts = posts.slice(1, 4);

  if (!posts.length) return null;

  return (
    <section className="sm:pt-[24px] md:pt-[32px] pb-[24px] sm:pb-[32px]">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10">
          <div className="heading_section max-w-[75%] !pb-0 !mb-0">
            <h2 className="pre_heading !mb-1">{heading}</h2>
            {subheading && <p className="sub_text">{subheading}</p>}
          </div>
          {/* {showSeeAll && (
            <Link
              href={seeAllHref}
              className="text-[#4C4C4C] text-[16px] sm:text-[18px] hover:text-[#d67938] hover:underline transition-colors font-bold inline-flex items-center gap-2 flex-shrink-0 sm:mt-2"
            >
              See All
              <img
                src="/arrow-right.png"
                className="w-[21px] h-[12px] inline-block"
                alt=""
                aria-hidden
              />
            </Link>
          )} */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[24px] items-start">
          {mirror ? (
            <>
              <ListPosts posts={otherPosts} />
              <LargePost post={featuredPost} />
            </>
          ) : (
            <>
              <LargePost post={featuredPost} />
              <ListPosts posts={otherPosts} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
