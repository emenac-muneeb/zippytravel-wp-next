//                                         <div>
//                                             <h3 className="text-base md:text-lg font-gloock text-secondary mb-1 line-clamp-2 hover:text-primary transition-colors">
//                                                 {post.title}
//                                             </h3>
//                                             <p className="text-sm text-gray-700 mb-1 line-clamp-2">
//                                                 {post.description}
//                                             </p>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-xs md:text-sm text-primary font-medium">
//                                                 {post.date}
//                                             </span>
//                                             <button className=" rounded-lg transition flex items-center gap-2 hover:underline">
//                                                 Read More
//                                                 <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </Link>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Load More Button */}
//                     {visiblePosts < blogPosts.length && (
//                         <div className="text-center mt-10 flex justify-center">
//                             <button
//                                 onClick={handleLoadMore}
//                                 className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline"
//                             >
//                                 Load More
//                                 <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }


import React, { useState, useEffect } from "react";
import { BASE_URL_IMG } from "../Helpers/imageurl";
import Link from "next/link";
import axios from "axios";

export default function BlogTabs({ blogs, pageNum, totalPages }) {
    const pageSize = 12; // posts per page
    const [currentPage, setCurrentPage] = useState(1);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${endpoints.allBlogs(pageNum)}`);
                const newBlogs = response.data;

                // Append new posts to existing posts
                setBlogPosts(prev => [...prev, ...newBlogs]);
            } catch (err) {
                console.error('❌ [ERROR] Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [pageNum]);

    // Load more handler
    const handleLoadMore = () => {
        if (pageNum < totalPages) {
            setPageNum(prev => prev + 1);
        }
    };

    return (
        <div className="py-8 md:py-12 px-4">
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-3">
                        Latest Posts
                    </h2>
                    <p className="text-sm md:text-base max-w-3xl">
                        Travellers always look for comfort on their air trips to the places. Emenac Travel comfort the customers over their budgets.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white border border-[#E1E1E1] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row"
                        >
                            <Link
                                href={`/blog/${post.page_url}/`}
                                className="flex flex-col sm:flex-row w-full"
                            >
                                <img
                                    src={post.yoast_head_json?.og_image?.[0]?.url || "https://via.placeholder.com/200"}
                                    alt={post.title.rendered}
                                    className="sm:w-[200px] sm:h-[144px] w-full object-cover flex-shrink-0"
                                />
                                <div className="py-2 px-4 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-base md:text-lg font-gloock text-secondary mb-1 line-clamp-2 hover:text-primary transition-colors"
                                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                        />
                                        <p className="text-sm text-gray-700 mb-1 line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-xs md:text-sm text-primary font-medium">
                                            {new Date(post.date).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <button
                                            onClick={handleLoadMore}
                                            className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline"
                                        >
                                            Load More
                                            <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {currentPage < totalPages && (
                    <div className="text-center mt-10 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline"
                        >
                            Load More
                            <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
