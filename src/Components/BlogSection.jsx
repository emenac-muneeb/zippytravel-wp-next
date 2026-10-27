"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { BASE_URL_IMG, resolveBlogUploadSrc } from "../Helpers/imageurl";

const DEFAULT_BLOGS = [
  {
    id: 1,
    title: "Air Europa Baggage Allowance for International Travellers: Explained",
    page_url: "air-europa-baggage-allowance",
    image: "/Mask group-1.png",
  },
  {
    id: 2,
    title: "Air Europa Baggage Allowance for International Travellers: Explained",
    page_url: "air-europa-baggage-allowance-2",
    image: "/Mask group-2.png",
  },
];

export default function BlogSection() {
  const [blogs, setBlogs] = useState(DEFAULT_BLOGS);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(
          "https://admin.premierflights.co.uk/api/get-blogs?latestblog=1"
        );
        if (res.data?.latest_blogs?.data?.length >= 2) {
          const apiBlogs = res.data.latest_blogs.data.slice(0, 2);
          setBlogs([
            {
              id: apiBlogs[0].id || 1,
              title: apiBlogs[0].title || DEFAULT_BLOGS[0].title,
              page_url: apiBlogs[0].page_url || DEFAULT_BLOGS[0].page_url,
              image: apiBlogs[0].image_url
                ? formatApiImage(apiBlogs[0].image_url)
                : "/Mask group-1.png",
            },
            {
              id: apiBlogs[1].id || 2,
              title: apiBlogs[1].title || DEFAULT_BLOGS[1].title,
              page_url: apiBlogs[1].page_url || DEFAULT_BLOGS[1].page_url,
              image: apiBlogs[1].image_url
                ? formatApiImage(apiBlogs[1].image_url)
                : "/Mask group-2.png",
            },
          ]);
        }
      } catch (e) {
        setBlogs(DEFAULT_BLOGS);
      }
    };
    fetchBlogs();
  }, []);

  const formatApiImage = (url) => {
    if (!url) return "/Mask group-1.png";
    const cleaned = resolveBlogUploadSrc(url);
    if (cleaned.startsWith("/blog/wp-content/uploads")) return cleaned;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://"))
      return cleaned;
    return `${BASE_URL_IMG}/media/${cleaned.replace(/^\/+/, "")}`;
  };

  return (
    <>
      <section className="w-full bg-white pt-[60px] sm:pt-[90px] lg:pt-[129px] pb-[40px] sm:pb-[60px] font-poppins overflow-hidden">
        {/* Full-width responsive container: exactly 1360px at standard desktop, expands smoothly on 2xl (1536px) and 3xl (1920px+ full screen) */}
        <div className="w-full max-w-[1360px] 2xl:max-w-[1550px] 3xl:max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-end justify-center gap-5 xl:gap-[20px] 2xl:gap-[28px] 3xl:gap-[32px]">
            
            {/* ── Left Group: background image + info card + overlay girl ── */}
            <div className="blog-left-group relative w-full max-w-[586px] 2xl:max-w-[650px] 3xl:max-w-[720px] h-[480px] sm:h-[513px] 2xl:h-[550px] 3xl:h-[580px] flex-shrink-0">
              
              {/* 1. Background Image Card (288px x 513px at 1360px, scales up on 2xl/3xl) */}
              <div className="blog-bg-card absolute left-0 bottom-0 w-[240px] sm:w-[288px] 2xl:w-[320px] 3xl:w-[355px] h-[480px] sm:h-[513px] 2xl:h-[550px] 3xl:h-[580px] rounded-[24px] sm:rounded-[28px] 3xl:rounded-[32px] overflow-hidden z-[1]">
                <img
                  src="/Mask group-3.png"
                  alt="Travel Background"
                  width={288}
                  height={513}
                  className="w-full h-full object-cover rounded-[24px] sm:rounded-[28px] 3xl:rounded-[32px] block"
                />
              </div>

              {/* 2. Info Card (318px x 465px at 1360px, scales up on 2xl/3xl) */}
              <div className="blog-info-card absolute right-0 sm:left-[268px] 2xl:left-[298px] 3xl:left-[330px] bottom-0 w-[calc(100%-200px)] sm:w-[318px] 2xl:w-[352px] 3xl:w-[390px] max-w-[390px] h-[440px] sm:h-[465px] 2xl:h-[500px] 3xl:h-[530px] bg-[#E9ECEF] rounded-[24px] sm:rounded-[28px] 3xl:rounded-[32px] z-[2] flex flex-col items-center text-center pt-[36px] sm:pt-[51px] 2xl:pt-[56px] 3xl:pt-[62px] px-4 sm:px-5 2xl:px-6 pb-6 sm:pb-[30px] box-border">
                <h2 className="font-poppins text-[30px] sm:text-[36px] lg:text-[40px] 2xl:text-[44px] 3xl:text-[48px] font-bold text-[#50A7C2] leading-[1.15] mb-2 sm:mb-[14px] text-center">
                  News &amp;
                  <br />
                  Updates
                </h2>
                <p className="font-poppins text-[15px] sm:text-[18px] lg:text-[20px] 2xl:text-[21px] 3xl:text-[22px] font-normal text-[#4A5568] leading-[1.4] sm:leading-[1.45] m-0 text-center">
                  Our customers can access our web site for a &lsquo;one-stop
                  shop&rsquo; including access to specially.
                </p>
                <Link
                  href="/blog/"
                  className="mt-5 sm:mt-[27px] 2xl:mt-[32px] w-[180px] sm:w-[220px] 2xl:w-[240px] 3xl:w-[260px] h-[54px] sm:h-[67px] 2xl:h-[72px] bg-[#1F0060] hover:bg-[#2b0380] rounded-[12px] sm:rounded-[14px] 2xl:rounded-[16px] text-white font-poppins text-[18px] sm:text-[22px] 2xl:text-[24px] font-bold inline-flex items-center justify-center transition-all duration-200 shadow-[0_4px_12px_rgba(31,0,96,0.2)] hover:-translate-y-0.5 flex-shrink-0"
                  id="blog-view-all-btn"
                >
                  View All Blogs
                </Link>
              </div>

              {/* 3. Floating Overlay Girl (Touches the button left edge, scales smoothly on 2xl/3xl) */}
              <div className="blog-overlay-wrapper absolute left-[30px] sm:left-[70px] 2xl:left-[80px] 3xl:left-[90px] bottom-0 w-[300px] sm:w-[383px] 2xl:w-[420px] 3xl:w-[465px] h-[380px] sm:h-[455px] 2xl:h-[495px] 3xl:h-[530px] z-[5] pointer-events-none">
                <img
                  src="/blog image png2 2.png"
                  alt="Traveler with luggage"
                  width={383}
                  height={455}
                  className="w-full h-full object-contain object-bottom block"
                />
              </div>
            </div>

            {/* ── Right Group: Two Blog Cards (285px each at 1360px, scales up on 2xl/3xl full width) ── */}
            <div className="blog-cards-group flex flex-col sm:flex-row items-center lg:items-end justify-center gap-5 xl:gap-[20px] 2xl:gap-[28px] 3xl:gap-[32px] flex-shrink-0">
              {blogs.map((blog, idx) => (
                <div
                  key={blog.id || idx}
                  className="blog-card-item w-full sm:w-[285px] 2xl:w-[350px] 3xl:w-[410px] h-[450px] sm:h-[465px] 2xl:h-[500px] 3xl:h-[530px] flex flex-col flex-shrink-0"
                >
                  {/* Card Image */}
                  <div className="blog-card-img-box w-full h-[330px] sm:h-[361px] 2xl:h-[390px] 3xl:h-[420px] rounded-[18px] sm:rounded-[20px] 2xl:rounded-[24px] overflow-hidden flex-shrink-0">
                    <Link href={`/blog/${blog.page_url}/`}>
                      <img
                        src={blog.image || (idx === 0 ? "/Mask group-1.png" : "/Mask group-2.png")}
                        alt={blog.title}
                        width={285}
                        height={361}
                        className="w-full h-full object-cover rounded-[18px] sm:rounded-[20px] 2xl:rounded-[24px] block transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src =
                            idx === 0 ? "/Mask group-1.png" : "/Mask group-2.png";
                        }}
                      />
                    </Link>
                  </div>

                  {/* Card Title */}
                  <Link
                    href={`/blog/${blog.page_url}/`}
                    className="mt-[10px] mb-[8px] 2xl:mt-[12px] 2xl:mb-[10px] block no-underline group"
                  >
                    <h3 className="font-poppins text-[15px] sm:text-[16px] 2xl:text-[18px] 3xl:text-[19px] font-bold text-[#1C2938] group-hover:text-[#50A7C2] transition-colors leading-[1.35] m-0 line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>

                  {/* Read More Button */}
                  <Link
                    href={`/blog/${blog.page_url}/`}
                    className="w-full h-[42px] 2xl:h-[46px] 3xl:h-[48px] bg-[#5CACC4] hover:bg-[#479bb3] rounded-[8px] 2xl:rounded-[10px] pl-4 pr-5 flex items-center justify-between text-white no-underline mt-auto transition-all duration-200 hover:-translate-y-0.5"
                    id={`blog-read-more-btn-${idx}`}
                  >
                    <span className="font-poppins text-[14px] sm:text-[16px] 2xl:text-[17px] font-bold tracking-[-0.2px] text-white">
                      READ MORE ABOUT THIS BLOG
                    </span>
                    <span className="flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <svg
                        width="8"
                        height="13"
                        viewBox="0 0 8 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 1.5L6.5 6.5L1.5 11.5"
                          stroke="white"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <style jsx global>{`
        @media (max-width: 480px) {
          .blog-bg-card {
            display: none !important;
          }
          .blog-left-group {
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .blog-overlay-wrapper {
            position: relative !important;
            left: auto !important;
            bottom: auto !important;
            width: 260px !important;
            height: 310px !important;
            margin-bottom: -50px !important;
            z-index: 5 !important;
          }
          .blog-info-card {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            width: 100% !important;
            max-width: 320px !important;
            height: auto !important;
            padding-top: 50px !important;
            padding-bottom: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
