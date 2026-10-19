"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import BlogPostsSection, {
  BlogListCard,
  getBlogImageUrl,
  stripHtml,
} from "../../Components/BlogPostsSection";
import "../../ExternalCSS/blog.css";

const LATEST_BLOGS_URL = "https://admin.premierflights.co.uk/api/get-blogs";

const STATIC_CTA = {
  heading: "The Taste Of Business Class / First Class",
  description:
    "Discover premium cabin experiences, gourmet menus, and the comfort that turns long-haul travel into something memorable.",
  image: "/blog1.png",
  bgImage: "/first-class-flight.png",
  href: "/blog/",
};


function BlogHero({ post }) {
  if (!post) return null;

  const href = post.page_url ? `/blog/${post.page_url}/` : "#";
  const excerpt = stripHtml(
    post.short_description || post.banner_description || post.description || ""
  );

  const imagePath = post.index_thumbnail_url || post.image_url;
  const imageSrc = imagePath?.startsWith("/")
    ? imagePath
    : getBlogImageUrl(imagePath);

  return (
    <section className="pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]">
      <div className="container-fluid">
        <div className="grid grid-cols-1 xxl:grid-cols-[1060px_1fr] lg:grid-cols-[636px_1fr] xl:grid-cols-[800px_1fr] gap-8 lg:gap-[24px] items-center px-[20px] lg:px-[0px] xl:px-[24px]">
          <Link
            href={href}
            className="block overflow-hidden rounded-[16px] order-1"
          >
            <img
              src={imageSrc}
              alt={post.image_alt || post.title || ""}
              className="w-full h-[360px] sm:h-[480px] lg:h-[480px] xl:h-[596px] object-cover rounded-[16px]"
            />
          </Link>
          <div className="order-2 flex flex-col justify-center max-w-[525px]">
            <Link href={href}>
              <h1 className="text-[22px] sm:text-[22px] lg:text-[26px] xl:text-[38px] font-bold text-black leading-tight mb-1 hover:text-grayText transition-colors">
                {post.title}
              </h1>
            </Link>
            {excerpt && (
              <p className="text-sm sm:text-base lg:text-[18px] text-[#4C4C4C] leading-relaxed mb-2 line-clamp-4">
                {excerpt}
              </p>
            )}
            <Link
              href={href}
              className="text-[#4C4C4C] text-[16px] sm:text-[22px] font-bold hover:underline inline-flex items-center gap-2"
            >
              Read More
              <img
                src="/media/fr-svgs/arrow-right.png"
                className="w-[21px] h-[12px] inline-block"
                alt=""
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogChoiceBanner({ post }) {
  const heading = post?.title;
  const rawDesc = stripHtml(
    post?.short_description || post?.banner_description || post?.description || ""
  );
  const description = rawDesc;
  const href = post?.page_url ? `/blog/${post.page_url}/` : "#";
  const imagePath = post?.index_thumbnail_url || post?.image_url;
  const imageSrc = imagePath
    ? (imagePath.startsWith("/") ? imagePath : getBlogImageUrl(imagePath))
    : "";

  return (
    <section
      className="blogwithbg lg:flex items-center min-h-[240px] sm:min-h-[600px] xl:min-h-[515px] relative w-full px-[20px] lg:px-[45px] pt-[24px] md:pt-[44px] pb-[24px] sm:pb-[44px] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${STATIC_CTA.bgImage}')` }}
    >
      <div className="absolute inset-0 bg-[rgba(113,62,0,0.8)]/70 z-0" />
      <div className="relative z-10 container">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr] xxl:grid-cols-[1fr] gap-8 lg:gap-[24px] items-center">
          <div className="text-white max-w-[500px] xxl:max-w-[520px]">
            <div className="heading_section head-white !pb-0 !mb-4 ">
              <h2 className="pre_heading text-white !mb-3 line-clamp-2">{heading}</h2>
            </div>
            <p className="text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 line-clamp-3">
              {description}
            </p>
            <Link
              href={href}
              className="text-white text-[16px] sm:text-[18px] font-bold hover:underline inline-flex items-center gap-2"
            >
              Read More
              <img
                src="/media/fr-svgs/arrow-right.png"
                className="w-[21px] h-[12px] inline-block"
                alt=""
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="absolteimg lg:mt-0 mt-[30px] w-full lg:w-[600px] xl:w-[700px] xxl:w-[780px] relative lg:absolute top-[auto] lg:top-[44px] right-[auto] lg:right-[45px]">
        <img
          src={imageSrc}
          alt={post?.image_alt || heading}
          className="w-full h-[330px] sm:h-[508px] xl:h-[427px] object-cover rounded-[16px]"
        />
      </div>
    </section>
  );
}

function LatestBlogsSection({
  heading,
  subheading,
  initialBlogs = [],
  totalPages = 1,
}) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [pageNum, setPageNum] = useState(1);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [extrasVisible, setExtrasVisible] = useState(false);

  useEffect(() => {
    setBlogs(initialBlogs);
    setPageNum(1);
    setExtrasVisible(false);
  }, [initialBlogs]);

  useEffect(() => {
    if (pageNum <= 1) return;

    const fetchMore = async () => {
      setLoadingBlogs(true);
      try {
        const res = await axios.get(
          `${LATEST_BLOGS_URL}?latestblog=1&page=${pageNum}`
        );
        const next = res.data.latest_blogs?.data || [];
        setBlogs((prev) => [...prev, ...next]);
        setExtrasVisible(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchMore();
  }, [pageNum]);

  const primaryPosts = blogs.slice(0, 4);
  const extraPosts = blogs.slice(4);
  const hasHiddenExtras = !extrasVisible && extraPosts.length > 0;
  const canLoadMore = hasHiddenExtras || pageNum < totalPages;

  const handleLoadMore = () => {
    if (loadingBlogs) return;
    // First click: reveal remaining page-1 posts in the 2-col grid
    if (hasHiddenExtras) {
      setExtrasVisible(true);
      return;
    }
    if (pageNum < totalPages) {
      setPageNum((prev) => prev + 1);
    }
  };

  if (!primaryPosts.length) return null;

  return (
    <div>
      <BlogPostsSection
        heading={heading}
        subheading={subheading}
        posts={primaryPosts}
        showSeeAll={false}
        mirror
      />

      {(extrasVisible && extraPosts.length > 0) || loadingBlogs ? (
        <div className="container pb-[24px] sm:pb-[32px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-x-[24px] lg:gap-y-8">
            {extrasVisible &&
              extraPosts.map((post, idx) => (
                <BlogListCard
                  key={post.id || post.page_url || `extra-${idx}`}
                  post={post}
                />
              ))}
            {loadingBlogs &&
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex gap-4 sm:gap-[24px] items-center animate-pulse"
                >
                  <div className="w-[120px] h-[80px] sm:w-[160px] sm:h-[100px] lg:w-[200px] lg:h-[112px] flex-shrink-0 rounded-[16px] bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-4/5 bg-gray-200 rounded" />
                    <div className="h-5 w-3/5 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : null}

      {canLoadMore && (
        <div className="container text-center pb-[24px] sm:pb-[32px] flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingBlogs}
            className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline font-semibold text-[#4C4C4C] disabled:opacity-60"
          >
            {loadingBlogs ? "Loading..." : "Load More"}
            <img src="/media/fr-svgs/arrow-right.png" alt="" className="w-[21px] h-[12px]" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlogClient({ initialData }) {
  const {
    blogPage,
    featuredBlogs = [],
    initialBlogs = [],
    totalPages = 1,
    airline_blogs = [],
    index_blogs = [],
  } = initialData || {};

  const widget1 = blogPage?.blogs_widget?.[0] || null;
  const widget2 = blogPage?.blogs_widget?.[1] || null;
  const widget3 = blogPage?.blogs_widget?.[2] || null;

  const firstIndexBlog = index_blogs[0] || null;
  const secondIndexBlog = index_blogs[1] || null;

  const heroPost = firstIndexBlog || featuredBlogs[0] || initialBlogs[0] || null;
  const featuredPosts = featuredBlogs.slice(0, 4);
  const airlinePosts = airline_blogs || [];

  return (
    <div className="w-full bg-white">
      <BlogHero post={heroPost} />

      <BlogPostsSection
        heading={widget1?.heading || "Featured Posts"}
        subheading={
          widget1?.sub_heading ||
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        }
        posts={featuredPosts}
        seeAllHref="/blog/"
      />

      <LatestBlogsSection
        heading={widget2?.heading || "Latest News"}
        subheading={
          widget2?.sub_heading ||
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        }
        initialBlogs={initialBlogs}
        totalPages={totalPages}
      />

      <BlogChoiceBanner post={secondIndexBlog} />
      <div className="py-[24px] sm:py-[32px]">
        <BlogPostsSection
          heading={widget3?.heading || "Airline Guides & Reviews"}
          subheading={
            widget3?.sub_heading ||
            "Discover top airline guides, cabin reviews, and travel tips."
          }
          posts={airlinePosts}
          seeAllHref="/blog/"
          showSeeAll
        />
      </div>
    </div>
  );
}
