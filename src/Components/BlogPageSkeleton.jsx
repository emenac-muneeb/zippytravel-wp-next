const BlogPageSkeleton = () => {
  return (
    <div className="px-4 py-6">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Blog Detail Skeleton */}
        <div className="lg:col-span-2 animate-pulse">
          {/* Title */}
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>

          {/* Featured Image */}
          <div className="w-full h-[250px] md:h-[400px] bg-gray-200 rounded mb-8"></div>

          {/* Meta */}
          <div className="flex gap-4 mb-6">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>

          {/* Paragraphs */}
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/5 bg-gray-200 rounded"></div>

            <div className="h-4 w-11/12 bg-gray-200 rounded mt-6"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>

            <div className="h-4 w-4/5 bg-gray-200 rounded mt-6"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/5 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* RIGHT: Blog List Skeleton */}
        <div className="space-y-6">
          
          {/* Header */}
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>

          {/* List Items */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#E1E1E1] shadow-md overflow-hidden flex flex-col sm:flex-row animate-pulse"
            >
              {/* Image */}
              <div className="sm:w-[120px] sm:h-[90px] w-full bg-gray-200"></div>

              {/* Content */}
              <div className="py-3 px-4 flex-1 flex flex-col gap-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>

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

export default BlogPageSkeleton;
