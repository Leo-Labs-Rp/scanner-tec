import { sanitizeCopy } from "@/lib/catalog";

export type ProductDetailContent = {
  functions: string[];
  highlights: string[];
  intro: string[];
  technicalSpecs: Array<[string, string]>;
};

type DetailSection = "functions" | "highlights" | "technicalSpecs";

function normalizeHeading(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/:$/, "")
    .trim();
}

function parseSpec(value: string): [string, string] | null {
  const separator = value.indexOf(":");
  if (separator <= 0) return null;

  const label = value.slice(0, separator).trim();
  const specValue = value.slice(separator + 1).trim();
  return label && specValue ? [label, specValue] : null;
}

export function parseProductDetailContent(value?: string | null): ProductDetailContent {
  const content: ProductDetailContent = {
    functions: [],
    highlights: [],
    intro: [],
    technicalSpecs: []
  };
  let currentSection: DetailSection | null = null;

  sanitizeCopy(value || "")
    .split(/\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .forEach((block) => {
      const heading = normalizeHeading(block);

      if (heading === "destaques do equipamento") {
        currentSection = "highlights";
        return;
      }

      if (heading === "principais testes e funcoes") {
        currentSection = "functions";
        return;
      }

      if (heading === "ficha tecnica") {
        currentSection = "technicalSpecs";
        return;
      }

      if (currentSection === "technicalSpecs") {
        const spec = parseSpec(block);
        if (spec) content.technicalSpecs.push(spec);
        return;
      }

      if (currentSection) {
        content[currentSection].push(block);
        return;
      }

      content.intro.push(block);
    });

  return content;
}
