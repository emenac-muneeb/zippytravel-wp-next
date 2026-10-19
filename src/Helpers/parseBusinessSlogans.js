import { BASE_URL_IMG, normalizeFrontendImageSrc } from "./imageurl";

function stripTags(html = "") {
  return String(html).replace(/<[^>]*>/g, "").trim();
}

/** First <p> = heading; remaining <p> tags = body/description. Also supports legacy <h3> + <p>. */
function parseSloganInput(input = "") {
  if (!input) return { title: "", description: "" };

  if (!input.includes("<")) {
    return { title: input.trim(), description: "" };
  }

  const pMatches = [...String(input).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  if (pMatches.length > 0) {
    const title = stripTags(pMatches[0][1]);
    const description = pMatches
      .slice(1)
      .map((m) => stripTags(m[1]))
      .filter(Boolean)
      .join(" ");
    return { title, description };
  }

  const h3Match = input.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  const pDescMatch = input.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (h3Match) {
    return {
      title: stripTags(h3Match[1]),
      description: pDescMatch ? stripTags(pDescMatch[1]) : "",
    };
  }

  return { title: stripTags(input), description: "" };
}

export function parseBusinessSlogans(settings) {
  if (!Array.isArray(settings)) {
    return { sloganHeading: { heading: "", subheading: "" }, features: [] };
  }

  const setting = settings.find((item) => item.id === 13);
  const contents = setting?.contents;
  if (!contents || contents.business_slogans_enable !== "1") {
    return { sloganHeading: { heading: "", subheading: "" }, features: [] };
  }

  const headingHtml = contents.business_slogans_main_heading || "";
  const h2Match = headingHtml.match(/<h2[^>]*>(.*?)<\/h2>/i);
  const pMatch = headingHtml.match(/<p[^>]*>(.*?)<\/p>/i);
  const heading = h2Match ? stripTags(h2Match[1]) : "";
  const subheading = pMatch ? stripTags(pMatch[1]) : "";

  const features = [];
  for (let i = 1; i <= 10; i++) {
    const icon = contents[`business_slogan_icon_${i}`];
    const input = contents[`business_slogan_input_${i}`];
    if (!icon || !input) continue;

    const { title, description } = parseSloganInput(input);

    features.push({
      title,
      description,
      image: `${BASE_URL_IMG}/${icon}`,
    });
  }

  const showPopupIndexRaw =
    contents.business_slogan_show_popup || contents.bsuiness_slogan_show_popup;
  const showPopupCardIndex = showPopupIndexRaw
    ? parseInt(showPopupIndexRaw, 10)
    : 1;

  return {
    sloganHeading: { heading, subheading },
    features,
    showPopupCardIndex,
  };
}

export function parsePortalLogos(settings) {
  if (!Array.isArray(settings)) return [];

  const setting = settings.find((item) => item.id === 13);
  const contents = setting?.contents;
  if (!contents || contents.portal_logos_and_Links !== "1") return [];

  const logos = [];
  Object.keys(contents).forEach((key) => {
    const match = key.match(/^upload_logo_(\d+)$/);
    if (!match) return;

    const index = Number(match[1]);
    const logo = contents[`upload_logo_${index}`];
    if (!logo || typeof logo !== "string" || !logo.trim()) return;

    const rawLink = contents[`upload_logo_link_${index}`];
    const rawTitle = contents[`upload_logo_title_${index}`];
    const link =
      typeof rawLink === "string" && rawLink.trim() ? rawLink.trim() : "";
    const title =
      typeof rawTitle === "string" && rawTitle.trim()
        ? rawTitle.trim()
        : `Logo ${index}`;
    const normalized = normalizeFrontendImageSrc(logo.trim());

    logos.push({
      index,
      img: normalized || `${BASE_URL_IMG}${logo.trim()}`,
      link,
      title,
    });
  });

  return logos.sort((a, b) => a.index - b.index);
}
