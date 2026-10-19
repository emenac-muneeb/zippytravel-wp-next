import React from 'react';
import { BASE_URL_IMG, resolveBlogUploadSrc } from '../Helpers/imageurl';
import BlogPostsSection from './BlogPostsSection';

/**
 * Featured posts block — matches blog page Featured Posts layout.
 */
export default function BlogListing({ f_blogs, loading, error, widget }) {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading blogs</p>;

    return (
        <BlogPostsSection
            heading={widget?.heading || 'Featured Posts'}
            subheading={widget?.sub_heading || ''}
            posts={(f_blogs || []).slice(0, 4)}
            seeAllHref="/blog/"
        />
    );
}

export function getBannerUrl(url) {
    if (!url) return "";
    const cleanedUrl = resolveBlogUploadSrc(url);
    if (cleanedUrl.startsWith("/blog/wp-content/uploads")) {
        return cleanedUrl;
    }
    if (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")) {
        return cleanedUrl;
    }
    return `${BASE_URL_IMG}/${cleanedUrl.replace(/^\/+/, "")}`;
}
