import { productCategories } from "@/lib/catalog";
import type { ProductCategory } from "@/types/product";

export const catalogPriceRanges = [
  { label: "Todos os preços", value: "todos", min: 0, max: Infinity },
  { label: "Até R$ 1.000", value: "ate-1000", min: 0, max: 1000 },
  { label: "R$ 1.000 a R$ 5.000", value: "1000-5000", min: 1000, max: 5000 },
  { label: "Acima de R$ 5.000", value: "acima-5000", min: 5000, max: Infinity },
  { label: "Sob consulta", value: "consulta", min: 0, max: 0 }
] as const;

export const storefrontCategoryOptions: Array<{ label: string; value: ProductCategory | "todos" }> = [
  { label: "Todos os produtos", value: "todos" },
  ...productCategories.map((category) => ({ label: category.label, value: category.value }))
];

export const categoryFilterLabels = {
  todos: "Todos os produtos",
  ...Object.fromEntries(productCategories.map((category) => [category.value, category.label]))
} as Record<ProductCategory | "todos", string>;

export const storefrontAdvantages = [
  {
    title: "Atendimento consultivo",
    text: "Orientação para escolher o equipamento certo.",
    icon: "fa-solid fa-headset"
  },
  {
    title: "Pagamento flexível",
    text: "Condições alinhadas conforme o orçamento.",
    icon: "fa-regular fa-credit-card"
  },
  {
    title: "Entrega ou retirada",
    text: "Envio combinado com a equipe de vendas.",
    icon: "fa-solid fa-truck-fast"
  },
  {
    title: "Suporte técnico",
    text: "Apoio especializado antes e depois da compra.",
    icon: "fa-solid fa-shield-halved"
  }
] as const;

export const storefrontAboutItems = [
  "Scanners automotivos e equipamentos de diagnóstico",
  "Máquinas, manômetros e soluções para oficinas",
  "Atendimento em São José do Rio Preto e região",
  "Suporte técnico especializado na escolha do equipamento"
] as const;
