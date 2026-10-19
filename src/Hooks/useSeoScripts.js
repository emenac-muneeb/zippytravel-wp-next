import { useEffect } from "react";
import axios from "axios";
import { endpoints } from "../Helpers/endpoints";

export default function useSeoScripts() {
  useEffect(() => {
    const fetchSeoScript = async () => {
      try {
        const res = await axios.get(endpoints.generalSettings);
        const seo = res.data?.result?.settings?.find(
          (item) =>
            item.ref_name ===
              "SEO Tracking or Other Scripts in the End of Body Tag" &&
            item.is_active
        );

        if (!seo?.contents) return;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = seo.contents;

        const nodes = Array.from(tempDiv.childNodes);
        const appendedNodes = [];

        for (const node of nodes) {
          if (node.tagName === "SCRIPT") {
            const script = document.createElement("script");

            // Copy attributes (e.g., src, type)
            Array.from(node.attributes).forEach((attr) => {
              script.setAttribute(attr.name, attr.value);
            });

            // Inline script content
            if (node.innerHTML) {
              script.innerHTML = node.innerHTML;
            }

            document.body.appendChild(script);
            appendedNodes.push(script);
          } else {
            document.body.appendChild(node);
            appendedNodes.push(node);
          }
        }

        // Cleanup on unmount
        return () => {
          appendedNodes.forEach((n) => {
            if (document.body.contains(n)) {
              document.body.removeChild(n);
            }
          });
        };
      } catch (err) {
        console.error("Failed to inject SEO scripts:", err);
      }
    };

    fetchSeoScript();
  }, []);
}
