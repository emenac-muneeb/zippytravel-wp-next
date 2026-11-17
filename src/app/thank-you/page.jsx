import ThankYouPageClient from "./ThankYouPageClient";
import { GetCanonicalUrl } from "../../Helpers/metadata";

export const metadata = {
  title: "Thank You",
  alternates: {
    canonical: GetCanonicalUrl("/thank-you/"),
  },
};

export default function Page() {
  return <ThankYouPageClient />;
}
