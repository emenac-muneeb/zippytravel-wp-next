const BlogListSkeleton = () => {
    return (
        <div className="px-4">
            <div className="max-w-8xl mx-auto ">
                {/* Header */}
                <div className="mb-8">
                    <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
                </div>

                {/* Skeleton Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="bg-white border border-[#E1E1E1] overflow-hidden shadow-md flex flex-col sm:flex-row animate-pulse"
                        >
                            {/* Left Image Skeleton */}
                            <div className="sm:w-[200px] sm:h-[144px] w-full bg-gray-200"></div>

                            {/* Right Content Skeleton */}
                            <div className="py-2 px-4 flex-1 flex flex-col gap-3">
                                <div className="space-y-2">
                                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                </div>

                                <div className="flex justify-between items-center mt-auto">
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogListSkeleton;
