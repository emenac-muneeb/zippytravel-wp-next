import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL_IMG } from '../Helpers/imageurl';
import { endpoints } from '../Helpers/endpoints';

const ReviewCard = ({ review }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const showReadMore = review.text.length > 350;

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };
    const displayedText = isExpanded ? review.text : review.text.slice(0, 350);

    return (
        <div className="relative bg-white border-8 border-[#E2CDDD] rounded-xl pt-12 pb-6 px-4 shadow-md hover:shadow-lg transition-all min-h-[270px]">
            <div className="absolute -top-10 left-32 rounded-full transform -translate-x-full border-8 border-[#E2CDDD]">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white">
                    <img
                        src={review.image}
                        alt={review.name}
                        className="w-full h-full object-cover rounded-full"
                    />
                </div>
            </div>

            <div className="mt-2 mb-2 space-y-2">
                <div className="flex justify-between items-center mb-2">
                    <h5 className="font-gloock text-secondaryHover">{review.name}</h5>
                    <div className="flex text-yellow-400 text-sm">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx}>{idx < review.rating ? '★' : '☆'}</span>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    {displayedText}
                    {showReadMore && (
                        <>
                            {!isExpanded && '...'}
                            <span
                                className="text-secondaryHover cursor-pointer font-semibold ml-1"
                                onClick={toggleReadMore}
                            >
                                {isExpanded ? ' Read Less' : ' Read More...'}
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

const ReviewSection = () => {
    const reviewsPerPage = 12;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(endpoints.reviews);
                if (response.data.status === 1) {
                    const cleaned = response.data.result.map((r) => ({
                        id: r.id,
                        name: r.publisher,
                        image: `${BASE_URL_IMG}/media/${r.image_url}`,
                        rating: parseInt(r.rating, 10),
                        text: r.review.replace(/<[^>]+>/g, ''),
                    }));
                    setReviews(cleaned);
                } else {
                    setError('Failed to fetch reviews');
                }
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Current visible reviews
    const visibleReviews = reviews.slice(0, currentPage * reviewsPerPage);

    return (
        <div className="py-10">
            {loading ? (
                <div className="text-center">Loading Reviews...</div>
            ) : error ? (
                <div className="text-red-600 text-center">{error}</div>
            ) : (
                <>
                    <div className="grid gap-6 space-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleReviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {visibleReviews.length < reviews.length && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-6 py-2 rounded-lg transition flex items-center gap-2 hover:underline font-bold"
                            >
                                Load More
                                <img src={`${BASE_URL_IMG}/assets/svgs/Arrow1.svg`} alt="Arrow" />
                            </button>
                        </div>
                    )}

                </>
            )}
        </div>
    );
};

export default ReviewSection;
