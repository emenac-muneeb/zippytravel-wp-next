"use client";

import Script from "next/script";
import { useEffect, useMemo } from "react";
import { parseScripts, parseOtherTags } from "../../Helpers/scriptParser";

const SMARTSUPP_LOADER_RE = /smartsuppchat\.com\/loader\.js/i;
const FEEFO_SCRIPT_RE = /feefo|register\.feefo\.com/i;

const THIRD_PARTY_PRELUDE =
  'window._smartsupp=window._smartsupp||{};' +
  'if(typeof window.smartsupp!=="function"){' +
  'window.smartsupp=function(){(window.smartsupp._=window.smartsupp._||[]).push(arguments);};' +
  "window.smartsupp._=window.smartsupp._||[];}";

function needsThirdPartyPrelude(scripts) {
  if (!scripts?.length) return false;
  return scripts.some(
    (s) =>
      (s.src && SMARTSUPP_LOADER_RE.test(s.src)) ||
      /_smartsupp|smartsupp/i.test(s.inner || "")
  );
}

function hasSmartsuppKey(scriptContent) {
  return /_smartsupp\.key\s*=|_smartsupp\s*=\s*\{[^}]*\bkey\b/i.test(
    scriptContent || ""
  );
}

function shouldSkipThirdPartyScript(src, scriptContent) {
  if (!src) return false;
  if (process.env.NODE_ENV === "development") {
    if (FEEFO_SCRIPT_RE.test(src) || SMARTSUPP_LOADER_RE.test(src)) {
      return true;
    }
  }
  if (SMARTSUPP_LOADER_RE.test(src) && !hasSmartsuppKey(scriptContent)) {
    return true;
  }
  return false;
}

function orderScripts(scripts) {
  if (!scripts?.length) return [];
  const inline = [];
  const external = [];
  const smartsuppLoaders = [];
  for (const script of scripts) {
    if (!script.src) inline.push(script);
    else if (SMARTSUPP_LOADER_RE.test(script.src)) smartsuppLoaders.push(script);
    else external.push(script);
  }
  return [...inline, ...external, ...smartsuppLoaders];
}

function isExecutableInlineScript(script) {
  return (
    script.inner &&
    !script.src &&
    script.type !== "application/ld+json" &&
    !(script.inner.trim().startsWith("{") && script.inner.trim().endsWith("}"))
  );
}

export default function ScriptInjector({
  scriptContent,
  strategy = "afterInteractive",
  target = "body",
}) {
  const parsedScripts = useMemo(
    () => (scriptContent ? parseScripts(scriptContent) : []),
    [scriptContent]
  );
  const scripts = useMemo(
    () =>
      orderScripts(parsedScripts).filter(
        (s) => !s.src || !shouldSkipThirdPartyScript(s.src, scriptContent)
      ),
    [parsedScripts, scriptContent]
  );
  const otherTags = useMemo(
    () => (scriptContent ? parseOtherTags(scriptContent) : []),
    [scriptContent]
  );
  const showPrelude = needsThirdPartyPrelude(parsedScripts);
  const inlineScripts = useMemo(
    () => scripts.filter(isExecutableInlineScript),
    [scripts]
  );

  useEffect(() => {
    if (!inlineScripts.length) return undefined;

    const mountTarget = target === "head" ? document.head : document.body;
    const injected = inlineScripts.map((s) => {
      const script = document.createElement("script");
      script.type = s.type || "text/javascript";
      script.text = s.inner;
      mountTarget.appendChild(script);
      return script;
    });

    return () => {
      injected.forEach((node) => node.remove());
    };
  }, [inlineScripts, target]);

  if (!scriptContent) return null;

  return (
    <>
      {otherTags.map((tag, idx) => {
        const Tag = tag.tagName;
        return <Tag key={`tag-${idx}`} {...(tag.attributes || {})} />;
      })}

      {showPrelude ? (
        <script
          key="third-party-prelude"
          dangerouslySetInnerHTML={{ __html: THIRD_PARTY_PRELUDE }}
        />
      ) : null}

      {scripts.map((s, idx) => {
        if (!s.src) {
          if (isExecutableInlineScript(s)) {
            return null;
          }

          return (
            <script
              key={`inline-${idx}`}
              type={s.type || "application/ld+json"}
              dangerouslySetInnerHTML={{ __html: s.inner }}
            />
          );
        }

        return (
          <Script
            key={`src-${idx}-${s.src}`}
            src={s.src}
            strategy={strategy}
            onError={() => {
              console.warn(`Third-party script failed to load: ${s.src}`);
            }}
          />
        );
      })}
    </>
  );
}
