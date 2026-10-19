import { notFound } from "next/navigation";
import * as cheerio from "cheerio";
import { endpoints } from "./endpoints";
import { normalizeFrontendImageSrc } from "./imageurl";

const EMPTY_SCROLL_RESULT = {
  filteredDescription: "",
  rightPanelImageUrl: null,
  rightPanelImageAlt: "Emenac Travel",
  isPngImage: false,
  hasContent: false,
};

/** Server-safe HTML parser for ScrollDetail — keeps SSR and CSR output aligned. */ 
export function parseScrollDescription(description) {
  if (typeof description !== "string" || !description.trim()) {
    return EMPTY_SCROLL_RESULT;
  }

  const root = cheerio.load(description);

  root("*").each((_, el) => {
    const item = root(el);
    item.removeAttr("style");
    const existing = (item.attr("class") || "").trim();
    item.attr("class", existing ? `${existing} font-quicksand` : "font-quicksand");
  });

  root("h1, h2, h3, h4, h5, h6").each((_, heading) => {
    const item = root(heading);
    const existing = (item.attr("class") || "").trim();
    item.attr("class", `${existing} !text-[#A57233]`.trim());
  });

  root("ul").each((_, ul) => {
    const item = root(ul);
    const existing = (item.attr("class") || "").trim();
    item.attr(
      "class",
      `${existing} list-disc pl-6 [&>li]:marker:text-[#A57233]`.trim(),
    );
  });

  root("ol").each((_, ol) => {
    const item = root(ol);
    const existing = (item.attr("class") || "").trim();
    item.attr(
      "class",
      `${existing} list-decimal pl-6 [&>li]:marker:text-[#A57233]`.trim(),
    );
  });

  root("table").each((_, table) => {
    const item = root(table);
    const existing = (item.attr("class") || "").trim();
    item.attr(
      "class",
      `${existing} w-full my-4 border border-gray-400 rounded-md`.trim()
    );
  });

  root("tr").each((_, row) => {
    const item = root(row);
    const existing = (item.attr("class") || "").trim();
    item.attr("class", `${existing} border-b border-gray-400`.trim());
  });

  root("th, td").each((_, cell) => {
    const item = root(cell);
    const existing = (item.attr("class") || "").trim();
    item.attr(
      "class",
      `${existing} px-2 py-2 text-left align-top border-r border-gray-400`.trim()
    );
  });

  root("th").each((_, th) => {
    const item = root(th);
    const existing = (item.attr("class") || "").trim();
    item.attr(
      "class",
      `${existing} font-semibold text-green-700 bg-gray-50`.trim()
    );
  });

  root("td").each((_, td) => {
    const item = root(td);
    const existing = (item.attr("class") || "").trim();
    item.attr("class", `${existing} text-gray-700`.trim());
  });

  const figureImg = root("figure img").first();
  const fallbackImg = root("img").first();
  const imageEl = figureImg.length ? figureImg : fallbackImg;

  let rightPanelImageUrl = null;
  let rightPanelImageAlt = "Emenac Travel";
  let isPngImage = false;

  const src = imageEl.attr("src");
  if (src) {
    rightPanelImageUrl = normalizeFrontendImageSrc(src);
    isPngImage = src.toLowerCase().endsWith(".png");
    rightPanelImageAlt = imageEl.attr("alt")?.trim() || "Emenac Travel";
    imageEl.closest("figure").remove();
  }

  root("img").each((_, img) => {
    const item = root(img);
    const imgSrc = item.attr("src");
    if (imgSrc) item.attr("src", normalizeFrontendImageSrc(imgSrc));
  });

  const filteredDescription = root("body").html() || "";
  const textContent = root("body").text().replace(/\s+/g, " ").trim();

  return {
    filteredDescription,
    rightPanelImageUrl,
    rightPanelImageAlt,
    isPngImage,
    hasContent: textContent.length > 0,
  };
}
/** Build page_url candidates so bare slugs (e.g. airlines) resolve to admin .htm/.html URLs. */
export function buildCmsPageUrlCandidates(pageUrl) {
  if (!pageUrl) return [];
  const raw = String(pageUrl);
  const noExt = raw.replace(/\.html$/i, "").replace(/\.htm$/i, "");
  const candidates = [];
  const add = (u) => {
    if (u && !candidates.includes(u)) candidates.push(u);
  };
  add(raw);
  add(noExt);
  add(`${noExt}.htm`);
  add(`${noExt}.html`);
  return candidates;
}

/** Fetch CMS page only when page_url matches admin exactly (no fallbacks). */
export async function fetchCmsPageByUrl(pageUrl) {
  try {
    const res = await fetch(`${endpoints.getPage}?page_url=${encodeURIComponent(pageUrl)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 1 || data.success === 1) return data.result;
  } catch (error) {
    console.error(`Error fetching CMS page ${pageUrl}:`, error);
  }
  return null;
}

/** Try bare / .htm / .html page_url variants until one matches admin. */
export async function fetchCmsPageByUrlVariants(pageUrl) {
  for (const candidate of buildCmsPageUrlCandidates(pageUrl)) {
    const pageData = await fetchCmsPageByUrl(candidate);
    if (pageData) return { pageData, resolvedUrl: candidate };
  }
  return null;
}

/** Pick UI template from admin page payload (widgets / page_url), not from hardcoded URLs. */
export function resolveCmsStaticPageType(pageData) {
  if (!pageData) return null;
  const widgets = String(pageData.widgets_content || "");
  const pageUrl = String(pageData.page_url || "").toLowerCase();
  const title = String(pageData.title || "").toLowerCase();

  if (
    pageUrl.includes("umrah") ||
    pageUrl.includes("flights-to") ||
    pageUrl.includes("holidays-to") ||
    pageData.umrahpackages_widget?.length
  ) {
    return null;
  }

  if (widgets.includes("AIRLINES")) return "airlines";
  if (widgets.includes("HOLIDAYCOUNTRY") || widgets.includes("HOLIDAY")) return "holidays";
  if (widgets.includes("DESTINATIONS")) return "continents";
  if (pageUrl.includes("thankyou")) return "thankyou";
  if (pageUrl.includes("customer-reviews")) return "customer-reviews";
  if (pageUrl.includes("about-us")) return "about-us";
  if (pageUrl.includes("contact-us") || title.includes("contact")) return "contact-us";
  if (
    pageUrl.includes("privacy") ||
    pageUrl.includes("cookies") ||
    pageUrl.includes("terms")
  ) {
    return "legal";
  }
  if (String(pageData.page_template) === "3") return "legal";
  return "legal";
}

/** Call when a route is backed by an admin CMS page_url; inactive/missing pages should 404. */
export function requireCmsPage(data) {
  if (!data) {
    notFound();
  }
}

export async function getGeneralSettings() {
  try {
    const res = await fetch(endpoints.generalSettings, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === 1 ? data.result : null;
  } catch (error) {
    console.error("Error fetching general settings:", error);
    return null;
  }
}
export function resolveGlobalVariables(text, globalVariables) {
  if (typeof text !== "string" || !globalVariables || !Array.isArray(globalVariables)) {
    return text;
  }
  let resolvedText = text;
  globalVariables.forEach((variable) => {
    if (variable.code && variable.code_value) {
      resolvedText = resolvedText.split(variable.code).join(variable.code_value);
    }
  });
  return resolvedText;
}
export function getWebsiteTitle(generalSettings) {
  const globalVariables =
    generalSettings?.result?.global_variables ||
    generalSettings?.global_variables ||
    [];
  const websiteTitleVariable = globalVariables.find(
    (v) => v.code === "[%WEBSITETITLE%]",
  );
  if (websiteTitleVariable?.code_value) return websiteTitleVariable.code_value;

  const settings = generalSettings?.settings || [];
  const websiteTitleSetting = settings.find(
    (s) => s.ref_name === "Website Title",
  );
  if (websiteTitleSetting?.contents) {
    return resolveGlobalVariables(websiteTitleSetting.contents, globalVariables);
  }
  return "";
}

export async function getPageMetaData(pageUrl) {
  try {
    const res = await fetch(`${endpoints.getPage}?page_url=${pageUrl}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === 1 ? data.result : null;
  } catch (error) {
    console.error("Error fetching page meta data:", error);
    return null;
  }
}

export function GetCanonicalUrl(path = "") {
  const baseUrl = "https://new.premierflights.co.uk";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Ensure the homepage has a proper trailing slash or none consistently
  if (cleanPath === "/") return baseUrl + "/";
  return `${baseUrl}${cleanPath}`;
}

export function getRobotsSetting(generalSettings) {
  const settings =
    generalSettings?.settings || generalSettings?.result?.settings || [];

  const indexSetting = settings.find(
    (s) =>
      s.ref_name === "Google Can Index?" ||
      (typeof s.ref_name === "string" &&
        s.ref_name.toLowerCase().includes("can index")) ||
      s.id === 18,
  );

  if (!indexSetting) return undefined;

  let contents = indexSetting.contents;
  if (typeof contents === "string") {
    try {
      contents = JSON.parse(contents);
    } catch {
      if (contents.trim() === "0") {
        return {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        };
      }
      if (contents.trim() === "1") {
        return undefined;
      }
    }
  }

  const canIndexVal = contents?.enable_google_can_index;

  // If enable_google_can_index is zero ("0", 0, false)
  // add "no index" tag on full website
  if (canIndexVal === "0" || canIndexVal === 0 || canIndexVal === false) {
    return {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  // If it is 1 then remove no index tag
  return undefined;
}
