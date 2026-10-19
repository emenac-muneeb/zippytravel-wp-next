"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { BASE_URL_IMG, resolveBlogUploadSrc } from "../Helpers/imageurl";

export default function LatestNews() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://admin.premierflights.co.uk/api/get-blogs?latestblog=1");
        if (res.data && res.data.latest_blogs?.data) {
          // The bigger blog is the first blog (index 0) and the other 3 will be the next 3 (indices 1, 2, 3)
          setBlogs(res.data.latest_blogs.data.slice(0, 4));
        } else {
          setError("Failed to fetch latest blogs");
        }
      } catch (err) {
        console.error("Error fetching latest blogs:", err);
        setError("Failed to fetch latest blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchLatestBlogs();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "";
    const cleanedUrl = resolveBlogUploadSrc(url);
    if (cleanedUrl.startsWith("/blog/wp-content/uploads")) {
      return cleanedUrl;
    }
    if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
      return cleanedUrl;
    }
    return `${BASE_URL_IMG}/media/${cleanedUrl.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <div className="py-12 sm:py-16 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex flex-col space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
              <div className="h-24 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || blogs.length === 0) {
    return null;
  }

  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1, 4);

  return (
    <div className="py-[15px] sm:py-[25px]">
      <div className="pt-[50px] pb-[40px] relative before:content-[''] before:absolute before:top-0 before:left-0 
      before:w-full xl:before:w-[80%] min-[1400px]:before:w-[1284px] before:h-full lg:before:h-[100%] before:bg-[#FFF6EC] before:rounded-[40px] before:-z-10">
        <div className="container">
          {/* Header Row */}
          <div className="md:flex justify-between items-center mb-8 relative w-full">
            <div className="heading_section max-w-[600px] !pb-0 !mb-0" style={{ paddingBottom: 0, marginBottom: 0 }}>
              <h2 className="pre_heading !mb-0 text-[42px]">Latest News</h2>
              <p className="text-[22px] text-[#4C4C4C]">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            </div>
            <Link
              href="/blog/"
              className="text-grayText text-[18px] hover:text-[#d67938] hover:underline transition-colors font-bold flex items-center gap-2 flex-shrink-0"
            >
              See All
              <img
                // src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`}
                src={`/media/fr-svgs/arrow-right.png`}
                className="w-[21.12px] h-[11.53px] inline-block"
                alt="Arrow"
              />
            </Link>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: 3 small blogs */}
            <div className="space-y-6">
              {otherBlogs.map((post, idx) => (
                <div key={post.id || idx}>
                  {idx > 0 && <div className="border-t border-[#E1E1E1] my-6 min-[431px]:my-[41px]" />}
                  <div className="flex flex-col min-[431px]:flex-row gap-4 sm:gap-6 items-start min-[431px]:items-center">
                    <div className="w-full min-[431px]:w-[200px] h-[200px] min-[431px]:h-[112px] flex-shrink-0 overflow-hidden rounded-2xl shadow-sm">
                      <Link href={`/blog/${post.page_url}/`}>
                        <img
                          src={getImageUrl(post.image_url)}
                          alt={post.image_alt || post.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <Link href={`/blog/${post.page_url}/`}>
                        <h4 className="text-black text-[18px] min-[431px]:text-[22px] font-bold line-clamp-3 hover:text-grayText transition-colors leading-tight">
                          {post.title}
                        </h4>
                      </Link>
                      <Link
                        href={`/blog/${post.page_url}/`}
                        className="text-grayText text-[18px] font-bold hover:underline flex items-center gap-2 mt-2"
                      >
                        Read More
                        <img
                          //   src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`}
                          src={`/media/fr-svgs/arrow-right.png`}
                          className="w-[21.12px] h-[11.53px] inline-block"
                          alt="Arrow"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: 1 large featured blog */}
            {featuredBlog && (
              <div className="flex flex-col bg-transparent rounded-3xl overflow-hidden lg:pl-4">
                <div className="w-full min-[431px]:w-[648px] h-[220px] min-[431px]:h-[364px] overflow-hidden rounded-3xl shadow-sm mb-4">
                  <Link href={`/blog/${featuredBlog.page_url}/`}>
                    <img
                      src={getImageUrl(featuredBlog.image_url)}
                      alt={featuredBlog.image_alt || featuredBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
                <div className="py-2">
                  <Link href={`/blog/${featuredBlog.page_url}/`}>
                    <h3 className="text-[20px] min-[431px]:text-[24px] font-bold font-gloock text-black hover:text-grayText transition-colors leading-snug mb-2">
                      {featuredBlog.title}
                    </h3>
                  </Link>
                  <div
                    className="text-xs sm:text-sm text-grayText line-clamp-2 mb-4 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: featuredBlog.short_description || featuredBlog.banner_description || "",
                    }}
                  />
                  <Link
                    href={`/blog/${featuredBlog.page_url}/`}
                    className="text-grayText text-[18px] font-bold  hover:underline flex items-center gap-2"
                  >
                    Read More
                    <img
                      //   src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`}
                      src={`/media/fr-svgs/arrow-right.png`}
                      className="w-[21.12px] h-[11.53px] inline-block"
                      alt="Arrow"
                    />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
