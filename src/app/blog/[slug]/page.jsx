import React from 'react';
import { endpoints } from '../../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../../Helpers/imageurl';
import BlogDetailClient from './BlogDetailClient';
import { notFound } from 'next/navigation';
import ScriptInjector from '../../../Components/common/ScriptInjector';

const url = `https://admin.premierflights.co.uk/api/get-blogs`

async function getBlogDetailData(slug) {
    try {
        const res = await fetch(`${url}?page_url=${slug}`, { next: { revalidate: 3600 } });
        const data = await res.json();

        const isNotFound =
            !res.ok ||
            data?.success === false ||
            data?.status === 0 ||
            data?.message === "Blog not found";

        if (isNotFound || !data?.blog?.id) {
            return null;
        }

        return {
            blogPage: data.blog,
            latestBlog: data.latest_blogs || [],
        };
    } catch (err) {
        console.error("Error fetching blog detail data:", err);
    }
    return null;
}

import { GetCanonicalUrl } from '../../../Helpers/metadata';

// ... (getBlogDetailData function remains same)

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getBlogDetailData(slug);
    
    if (!data) return { title: 'Blog Not Found' };

    const { blogPage } = data;
    const metaTitle = blogPage.browser_title || blogPage.title || 'Blog | Emenac Travel';
    const metaDescription = (blogPage.meta_description || blogPage.description?.replace(/<[^>]*>/g, '').substring(0, 160)) || "";
    const ogImage = blogPage.image_url ? (blogPage.image_url.startsWith('http') ? blogPage.image_url : `${BASE_URL_IMG}/${blogPage.image_url}`) : '';
    const canonical = GetCanonicalUrl(`/blog/${slug}`);

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: blogPage.meta_keywords || '',
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            url: canonical,
            images: ogImage ? [{ url: ogImage }] : [],
            type: 'article',
            siteName: 'Emenac Travel'
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: ogImage ? [ogImage] : [],
        }
    };
}


export default async function Page({ params }) {
    const { slug } = await params;
    const data = await getBlogDetailData(slug);

    if (!data) {
        notFound();
    }

    return (
        <>
            <ScriptInjector scriptContent={data.blogPage?.script} />
            <BlogDetailClient initialData={data} />
        </>
    );
}
