"use client";
import React, { useMemo } from 'react';
import ContactSection from '../../Components/ContactSection';
import ContactInfo from '../../Components/ContactInfo';
import StaticBanner from '../../Components/StaticBanner';

function parseContactUsWidgets(widgetsContent = '') {
    const regex =
        /\{\{\s*CONTACT\s+US(?:[^}]*)heading="([^"]*)"(?:[^}]*)sub_heading="([^"]*)"(?:[^}]*)\}\}/gi;
    const widgets = [];
    let match;
    while ((match = regex.exec(String(widgetsContent))) !== null) {
        widgets.push({
            heading: (match[1] || '').trim(),
            subHeading: (match[2] || '').trim(),
        });
    }
    return widgets;
}

export default function ContactUsClient({ initialData }) {
    const contactWidgets = useMemo(
        () => parseContactUsWidgets(initialData?.widgets_content || ''),
        [initialData?.widgets_content]
    );

    const formHeading = contactWidgets[0]?.heading || '';
    const formSubHeading = contactWidgets[0]?.subHeading || '';
    const infoHeading = contactWidgets[1]?.heading || '';
    const infoSubHeading = contactWidgets[1]?.subHeading || '';

    return (
        <>
            <StaticBanner
                titleOverride={initialData?.title}
                descriptionOverride={initialData?.banner_description}
                initialBanners={initialData?.banner_img?.[0]?.url}
            />
            <div className="container">
                <div className="w-full mx-auto space-y-8">
                    <ContactSection
                        heading={formHeading}
                        subHeading={formSubHeading}
                    />
                    <ContactInfo
                        heading={infoHeading}
                        subHeading={infoSubHeading}
                    />
                </div>
            </div>
        </>
    );
}
