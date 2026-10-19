import React from 'react';

const JsonLdScripts = () => {

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": ["Organization", "TravelAgency"],
        "name": "Emenac Travel",
        "url": "https://www.premierflights.co.uk",
        "logo": "https://admin.premierflights.co.uk/storage/uploads/settings/1755082130_logo.svg",
        "description": "Emenac Travel is a trusted UK-based travel agency offering cheap flights, holiday packages, and worldwide travel deals.",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "‪+44 207 043 4343‬",
            "contactType": "customer service",
            "areaServed": "GB",
            "availableLanguage": "English"
        },
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Suite No.5, The Old Dispensary, 30 Romford Rd",
            "addressLocality": "London",
            "postalCode": "E15 4BZ",
            "addressCountry": "United Kingdom"
        },
        "sameAs": [
            "https://www.facebook.com/Emenactraveluk/",
            "https://instagram.com/emenactraveluk/",
            "https://www.youtube.com/channel/UCL-TaYy_Ih4zvMMoF360yFQ"
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How can flight costs be compared?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Depending on your departure airport and flight date, you can compare airline ticket prices. Allow your travel agent to do the research for cheap flights while you relax. You can look up the various airlines available for your trip and compare prices to see which offers the best value."
                }
            },
            {
                "@type": "Question",
                "name": "When are the least expensive days to fly?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "By finding out which days are the least expensive for flying, you can save more money on your flight reservations. However, depending on your destination, you may or may not be able to travel on a budget."
                }
            },
            {
                "@type": "Question",
                "name": "How far in advance should I book my airline tickets for a successful trip?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Make a flight reservation 3 to 4 weeks before your departure date with Emenac Travel in London to secure a reasonable ticket. During peak travel seasons, it is best to book 45 to 60 days ahead of time as prices constantly rise and are subject to change."
                }
            },
            {
                "@type": "Question",
                "name": "From the UK, I'm looking for inexpensive flights. When should I make a reservation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We advise you to make your reservations as soon as possible when searching for inexpensive flights from the UK. Off-season travel offers more chances to find lower-cost flights, so it’s best to consult with your travel advisor well in advance."
                }
            },
            {
                "@type": "Question",
                "name": "Which international airlines are the best?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Low-cost airlines provide great value for money, and many international carriers also offer affordable fares to make flying more convenient. Popular options include WestJet, Jetstar Airways, Ryanair, and EasyJet."
                }
            },
            {
                "@type": "Question",
                "name": "Where can I find affordable flight options?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "If you are a traveller on a tight budget looking for low-cost flights, Emenac Travel offers attractive deals and special discounts for international trips. With just a few clicks, you can book your dream destination at affordable rates."
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    )
}

export default JsonLdScripts;
