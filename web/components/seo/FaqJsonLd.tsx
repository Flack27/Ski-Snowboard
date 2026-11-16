import { FAQS } from "@/lib/site";
import { JsonLd } from "./JsonLd";

// schema.org FAQPage for the home-page FAQ — helps Google show rich results.
export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <JsonLd data={data} />;
}
