"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonHeroSection from '../../Components/CommonHeroSection';
import BrandingSection from '../../Components/BrandingSection';
import UmrahCardByStar from '../../Components/UmrahCardByStar';
import ScrollDetail from '../../Components/ScrollDetail';
import FaqSection from '../../Components/FaqSection';
import { endpoints } from '../../Helpers/endpoints';
import { BASE_URL_IMG } from '../../Helpers/imageurl';
import useUmrahPackageBreadcrumbs from '../../Hooks/useUmrahPackageBreadcrumbs';



export default function UmrahGeneralClient({ initialData, slug }) {
    const [umrahPage, setUmrahPage] = useState(initialData);
    const [customPackages, setCustomPackages] = useState([]);
    const [loading, setLoading] = useState(!initialData);
    const [UmrahResponse, setUmrahResponse] = useState(null);
    const breadcrumbs = useUmrahPackageBreadcrumbs(umrahPage?.title);

    useEffect(() => {
        if (!initialData && slug) {
            setLoading(true);
            axios.get(`${endpoints.getPage}?page_url=${slug}`)
                .then((res) => {
                    if (res.data.status === 1 || res.data.success === 1) {
                        setUmrahPage(res.data.result);
                    }
                })
                .catch((err) => console.error('Error fetching Umrah Page:', err))
                .finally(() => setLoading(false));
        }
    }, [slug, initialData]);



    useEffect(() => {
        const fetchPackages = async () => {
            try {
                let url;
                if (umrahPage?.umrahpackages_widget?.length) {
                    const allIds = umrahPage?.umrahpackages_widget
                        .map((w) => w.umrah_package_ids)
                        .filter(Boolean)
                        .join(",");
                    
                    if (allIds) {
                        url = `https://admin.premierflights.co.uk/api/umrah-type?package_id=${allIds}`;
                    } else {
                        url = endpoints.umrahType;
                    }
                } else {
                    url = endpoints.umrahType;
                }
                const res = await axios.get(url);
                if (res.data.status === 1) {
                    setCustomPackages(res.data.result);
                }
            } catch (err) {
                console.error("Failed to fetch Packages:", err);
            }
        };

        if (umrahPage) {
            fetchPackages();
        }
    }, [umrahPage?.umrahpackages_widget]);

    if (loading) {
        return (
            <div className="container w-full mx-auto py-10 text-center text-gray-500">
                Loading Umrah Packages...
            </div>
        );
    }

    if (!umrahPage) {
        return (
            <div className="container w-full mx-auto py-10 text-center text-gray-500">
                Umrah Page Not Found
            </div>
        );
    }

    return (
        <div className="container">
            <div className='pt-[87px] sm:pt-[100px] pb-[24px] sm:pb-[32px]'>
                {breadcrumbs}

                <CommonHeroSection
                    banners={umrahPage?.banner_img || []}
                    description={umrahPage?.description || ''}
                    UmrahTab="UmrahPage"
                    formType="general umrah packages"
                />

                <BrandingSection />

                {umrahPage?.umrahpackages_widget && umrahPage.umrahpackages_widget.map((pkg, index) => (
                    <div key={index} className="mt-12">
                        <h2 className="text-2xl text-secondary mb-1 tracking-wide">
                            {pkg.heading}
                        </h2>

                        {pkg.sub_heading && (
                            <p className="mb-4">{pkg.sub_heading}</p>
                        )}

                        <UmrahCardByStar
                            minStar={parseInt(pkg.heading)}
                            maxStar={parseInt(pkg.heading)}
                            UmrahResponse={UmrahResponse}
                            setUmrahResponse={setUmrahResponse}
                            customPackages={customPackages}
                            allowedPackageIds={
                                pkg.umrah_package_ids
                                    ? pkg.umrah_package_ids.split(",").map((x) => Number(x.trim())).filter(Boolean)
                                    : []
                            }
                        />
                    </div>
                ))}

                {umrahPage?.scroll_description && (
                    <div className='my-12'>
                        <ScrollDetail description={umrahPage.scroll_description} />
                    </div>
                )}

                {umrahPage?.faq_widget && umrahPage.faq_widget[0]?.heading && (
                    <div className='mb-6 mt-4'>
                        <FaqSection
                            heading={umrahPage?.faq_widget[0]?.heading || ''}
                            subheading={umrahPage?.faq_widget[0]?.sub_heading || ''}
                            faq_ids={
                                umrahPage?.faq_widget?.[0]?.faq_ids
                                    ? umrahPage.faq_widget[0].faq_ids.split(',').map(Number)
                                    : []
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
