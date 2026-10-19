import UmrahPackageDetail from "../../../Components/UmrahPackageDetail";
import { endpoints } from "../../../Helpers/endpoints";
import { notFound } from "next/navigation";
import ScriptInjector from "../../../Components/common/ScriptInjector";
import { GetCanonicalUrl } from "../../../Helpers/metadata";
import { BASE_URL_IMG } from "../../../Helpers/imageurl";

async function getUmrahPackageData(slug) {
    try {
        const res = await fetch(`${endpoints.umrahType}?slug=${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.status === 1 ? data.result : null;
    } catch (err) {
        console.error("Error fetching umrah package data:", err);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getUmrahPackageData(slug);
    
    if (!data) return { title: 'Package Not Found' };

    const pageTitle = data.browser_title || data.title;
    const metaDesc = data.meta_description || "";
    const imageUrl = data.image_url ? `${BASE_URL_IMG}/${data.image_url}` : '';
    const canonical = GetCanonicalUrl(`/umrah/${slug}`);

    return {
        title: pageTitle,
        description: metaDesc,
        keywords: data.meta_keywords || "",
        alternates: {
            canonical: canonical,
        },
        openGraph: {
            title: pageTitle,
            description: metaDesc,
            url: canonical,
            images: imageUrl ? [{ url: imageUrl }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: metaDesc,
            images: imageUrl ? [imageUrl] : [],
        }
    };
}

export default async function UmrahDetailPage({ params }) {
    const { slug } = await params;
    const data = await getUmrahPackageData(slug);

    if (!data) {
        notFound();
    }

    return (
        <>
            <ScriptInjector scriptContent={data.script} />
            <UmrahPackageDetail initialData={data} />
        </>
    );
}

