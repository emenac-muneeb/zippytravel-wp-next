/**
 * Utility to parse script tags from an HTML string.
 * Extracts src, inner content, and type.
 */
export function parseScripts(htmlString) {
  if (!htmlString) return [];
  const scripts = [];
  // Regex to find <script> tags and their content
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
  let match;
  
  while ((match = scriptRegex.exec(htmlString)) !== null) {
    const fullTag = match[0];
    const inner = match[1];
    const openingTag = fullTag.match(/<script\b([^>]*)>/i)?.[1] || "";

    // Only read attributes from the opening tag — not src= strings inside inline JS
    const srcMatch = openingTag.match(/\bsrc=["']([^"']+)["']/i);
    const typeMatch = openingTag.match(/\btype=["']([^"']+)["']/i);
    
    const type = typeMatch ? typeMatch[1] : null;
    const isJsonLd = type === 'application/ld+json' || (inner.trim().startsWith('{') && inner.trim().endsWith('}'));

    scripts.push({
      src: srcMatch ? srcMatch[1] : null,
      inner: inner || null,
      type: isJsonLd ? 'application/ld+json' : type,
      id: `script-${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  return scripts;
}

/**
 * Utility to parse meta and link tags from an HTML string.
 * Returns tag name and attributes object.
 */
export function parseOtherTags(htmlString) {
  if (!htmlString) return [];
  const tags = [];
  // Regex to find <meta> and <link> tags
  const tagRegex = /<(meta|link)\b([^ix]*)\/?>/gm;
  let match;
  
  while ((match = tagRegex.exec(htmlString)) !== null) {
    const tagName = match[1];
    const attrString = match[2];
    const attributes = {};
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      attributes[attrMatch[1]] = attrMatch[2];
    }
    
    tags.push({
      tagName,
      attributes,
      id: `tag-${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  return tags;
}
