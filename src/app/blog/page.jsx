import React from 'react';
import { endpoints } from '../../Helpers/endpoints';
import BlogClient from './BlogClient';
import { GetCanonicalUrl } from '../../Helpers/metadata';
import ScriptInjector from '../../Components/common/ScriptInjector';

const url = `https://admin.premierflights.co.uk/api/get-blogs`;

async function getBlogData() {
    try {
        const [pageRes, featuredRes, latestRes, airlineRes, indexRes] = await Promise.all([
            fetch(`${endpoints.getPage}?page_url=blog`, { next: { revalidate: 3600 } }),
            fetch(`${url}?featured=1`, { next: { revalidate: 3600 } }),
            fetch(`${url}?latestblog=1`, { next: { revalidate: 3600 } }),
            fetch(`${url}?airline_blogs=1`, { next: { revalidate: 3600 } }),
            fetch(`${url}?index_blogs=1`, { next: { revalidate: 3600 } }),
        ]);

        const pageData = await pageRes.json();
        const featuredData = await featuredRes.json();
        const latestData = await latestRes.json();
        const airlineData = await airlineRes.json().catch(() => ({}));
        const indexData = await indexRes.json().catch(() => ({}));

        const airlineBlogsList =
            latestData.airline_blogs?.data ||
            airlineData.airline_blogs?.data ||
            airlineData.data ||
            [];

        const indexBlogsList =
            latestData.index_blogs?.data ||
            latestData.index_blogs ||
            indexData.index_blogs?.data ||
            indexData.index_blogs ||
            indexData.data ||
            [];

        return {
            blogPage: (pageData.status === 1 || pageData.success === 1) ? pageData.result : null,
            featuredBlogs: featuredData.featured_blogs || [],
            initialBlogs: latestData.latest_blogs?.data || [],
            airline_blogs: airlineBlogsList,
            index_blogs: indexBlogsList,
            totalPages: latestData.latest_blogs?.last_page || 1,
        };
    } catch (err) {
        console.error("Error fetching blog data:", err);
    }
    return { blogPage: null, featuredBlogs: [], initialBlogs: [], airline_blogs: [], index_blogs: [], totalPages: 1 };
}

export async function generateMetadata() {
    const { blogPage } = await getBlogData();
    if (!blogPage) return { title: 'Blog' };

    const pageTitle = blogPage.browser_title || 'Blog';
    const metaDesc = blogPage.meta_description || "";
    const imageUrl = blogPage.image_url ? blogPage.image_url : '';
    const canonical = GetCanonicalUrl('/blog');

    return {
        title: pageTitle,
        description: metaDesc,
        keywords: blogPage.meta_keywords || "",
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: pageTitle,
            description: metaDesc,
            url: canonical,
            images: imageUrl ? [{ url: imageUrl }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDesc,
            images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default async function Page() {
    const data = await getBlogData();
    const scriptContent = data.blogPage?.script;

    return (
        <>
            <ScriptInjector scriptContent={scriptContent} />
            <BlogClient initialData={data} />
        </>
    );
}
