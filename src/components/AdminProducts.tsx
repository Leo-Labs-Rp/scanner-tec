"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CloseIcon } from "@/components/SiteIcons";
import { formatCategoryLabel, productCategories, transparentLogoUrl } from "@/lib/catalog";
import { formatCurrency, slugify } from "@/lib/format";
import type { StorageAdminStatus } from "@/lib/supabase-storage";
import type { Product, ProductCategory, ProductInput } from "@/types/product";
import type { HomeBannerSettings, HomeBannerSlide } from "@/types/site-settings";

const emptyProduct: ProductInput = {
  name: "",
  slug: "",
  sku: "",
  category: "scanners",
  brand: "",
  description: "",
  detail: "",
  price: null,
  oldPrice: null,
  imageUrl: "/assets/catalogo-secoes.jpeg",
  images: ["/assets/catalogo-secoes.jpeg"],
  youtubeUrl: "",
  active: true,
  featured: false,
  mostViewed: false,
  stockStatus: "Disponível sob consulta",
  paymentNote: "Consultar condições",
  paymentInfo: "Consultar condições",
  tags: [],
  useTags: [],
  specs: {}
};

type Props = {
  initialProducts: Product[];
  initialBannerSettings: HomeBannerSettings;
  initialDatabaseConfigured: boolean;
  initialStorageStatus: StorageAdminStatus;
};

type UploadTarget = "banner" | "product";
type AdminStatusFilter = "todos" | "ativos" | "inativos" | "destaques";

function createBannerSlide(id: string): HomeBannerSlide {
  return {
    id,
    eyebrow: "Destaque ScannerTec",
    title: "",
    description: "",
    imageUrl: "/assets/marcas-parceiras.jpeg",
    linkedProductSlug: ""
  };
}

const emptyBannerSettings: HomeBannerSettings = {
  rotationMs: 4000,
  slides: [createBannerSlide("banner-1")]
};

function parseList(value: string) {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatList(value?: string[]) {
  return (value || []).join("\n");
}

function parseSpecs(value: string) {
  if (!value.trim()) return {};

  const parsed = JSON.parse(value) as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(parsed)
      .map(([key, item]) => [key.trim(), String(item).trim()])
      .filter(([key, item]) => key && item)
  );
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

export default function AdminProducts({
  initialProducts,
  initialBannerSettings,
  initialDatabaseConfigured,
  initialStorageStatus
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategory | "todos">("todos");
  const [productStatusFilter, setProductStatusFilter] = useState<AdminStatusFilter>("todos");
  const [message, setMessage] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [storageMessage, setStorageMessage] = useState("");
  const [spreadsheetMessage, setSpreadsheetMessage] = useState("");
  const [spreadsheetErrors, setSpreadsheetErrors] = useState<string[]>([]);
  const [databaseConfigured, setDatabaseConfigured] = useState(initialDatabaseConfigured);
  const [storageStatus, setStorageStatus] = useState(initialStorageStatus);
  const [specsText, setSpecsText] = useState("{}");
  const [bannerForm, setBannerForm] = useState<HomeBannerSettings>({
    rotationMs: initialBannerSettings.rotationMs || emptyBannerSettings.rotationMs,
    slides: initialBannerSettings.slides?.length ? initialBannerSettings.slides : emptyBannerSettings.slides
  });
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const canSave = useMemo(() => form.name.trim() && form.description.trim(), [form]);
  const canSaveBanner = useMemo(
    () =>
      bannerForm.slides.length > 0 &&
      bannerForm.slides.every(
        (slide) => slide.title.trim() && slide.description.trim() && slide.imageUrl.trim()
      ),
    [bannerForm]
  );
  const safeSlides = useMemo(
    () =>
      Array.isArray(bannerForm.slides)
        ? bannerForm.slides.filter((slide): slide is HomeBannerSlide => Boolean(slide?.id))
        : [],
    [bannerForm.slides]
  );
  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((product): product is Product => Boolean(product?.id)) : []),
    [products]
  );
  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();

    return safeProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        `${product.name} ${product.brand || ""} ${product.slug} ${product.sku || ""} ${product.description}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesCategory =
        productCategoryFilter === "todos" || product.category === productCategoryFilter;
      const matchesStatus =
        productStatusFilter === "todos" ||
        (productStatusFilter === "ativos" && product.active) ||
        (productStatusFilter === "inativos" && !product.active) ||
        (productStatusFilter === "destaques" && product.featured);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [productCategoryFilter, productSearch, productStatusFilter, safeProducts]);
  const productStats = useMemo(
    () => ({
      total: safeProducts.length,
      active: safeProducts.filter((product) => product.active).length,
      featured: safeProducts.filter((product) => product.featured).length,
      inactive: safeProducts.filter((product) => !product.active).length
    }),
    [safeProducts]
  );

  useEffect(() => {
    if (typeof document === "undefined" || !productEditorOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductEditorOpen(false);
        setEditingId(null);
        setForm(emptyProduct);
        setSpecsText("{}");
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [productEditorOpen]);

  async function loadProducts() {
    const response = await fetch("/api/products?includeInactive=true", { cache: "no-store" });
    const data = await readJsonResponse(response);
    setProducts(Array.isArray(data.products) ? (data.products.filter(Boolean) as Product[]) : []);
    setDatabaseConfigured(Boolean(data.databaseConfigured));
  }

  async function exportSpreadsheet() {
    setSpreadsheetMessage("");
    setSpreadsheetErrors([]);

    setBusyKey("spreadsheet-export");

    try {
      const response = await fetch("/api/admin/products/export");

      if (!response.ok) {
        const data = await readJsonResponse(response);
        setSpreadsheetMessage(String(data.message || "Não foi possível exportar a planilha."));
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scannertec-produtos-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSpreadsheetMessage("Planilha exportada com os produtos atuais.");
    } finally {
      setBusyKey(null);
    }
  }

  async function importSpreadsheet(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSpreadsheetMessage("");
    setSpreadsheetErrors([]);

    const formData = new FormData();
    formData.append("file", file);
    setBusyKey("spreadsheet-import");

    try {
      const response = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setSpreadsheetMessage(String(data.message || "Não foi possível importar a planilha."));
        return;
      }

      setSpreadsheetMessage(String(data.message || "Planilha importada."));
      setSpreadsheetErrors(Array.isArray(data.errors) ? (data.errors as string[]).slice(0, 6) : []);
      await loadProducts();
    } finally {
      setBusyKey(null);
    }
  }

  async function refreshStorageStatus() {
    const response = await fetch("/api/admin/storage", { cache: "no-store" });
    const data = await readJsonResponse(response);
    if (data.storage) {
      setStorageStatus(data.storage as StorageAdminStatus);
    }
  }

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateBannerField<K extends keyof HomeBannerSettings>(key: K, value: HomeBannerSettings[K]) {
    setBannerForm((current) => ({ ...current, [key]: value }));
  }

  function updateBannerSlide(id: string, key: keyof HomeBannerSlide, value: string) {
    setBannerForm((current) => ({
      ...current,
      slides: current.slides.map((slide) => (slide?.id === id ? { ...slide, [key]: value } : slide))
    }));
  }

  function addBannerSlide() {
    setBannerForm((current) => ({
      ...current,
      slides: [...current.slides, createBannerSlide(`banner-${current.slides.length + 1}`)]
    }));
  }

  function removeBannerSlide(id: string) {
    setBannerForm((current) => ({
      ...current,
      slides: current.slides.length > 1 ? current.slides.filter((slide) => slide?.id !== id) : current.slides
    }));
  }

  function addImageToForm(url: string, makePrimary = false) {
    setForm((current) => {
      const mergedImages = Array.from(new Set([url, ...(current.images || []), current.imageUrl].filter(Boolean)));
      return {
        ...current,
        imageUrl: makePrimary ? url : current.imageUrl || url,
        images: mergedImages
      };
    });
  }

  function fillProductForm(product: ProductInput) {
    setForm({
      ...product,
      images: product.images?.length ? product.images : [product.imageUrl],
      paymentInfo: product.paymentInfo || product.paymentNote || product.stockStatus,
      useTags: product.useTags || product.tags || [],
      specs: product.specs || {}
    });
    setSpecsText(JSON.stringify(product.specs || {}, null, 2));
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    fillProductForm(product);
    setMessage("");
    setProductEditorOpen(true);
  }

  function createProductDraft() {
    setEditingId(null);
    setMessage("");
    fillProductForm(emptyProduct);
    setProductEditorOpen(true);
  }

  function duplicateProduct(product: Product) {
    setEditingId(null);
    setMessage("");
    fillProductForm({
      ...product,
      id: undefined,
      name: `${product.name} - cópia`,
      slug: `${slugify(product.slug || product.name)}-copia`,
      featured: false,
      mostViewed: false
    });
    setProductEditorOpen(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProduct);
    setSpecsText("{}");
  }

  function closeProductEditor() {
    setProductEditorOpen(false);
    resetForm();
  }

  async function prepareStorage() {
    setStorageMessage("");
    setBusyKey("storage-setup");

    try {
      const response = await fetch("/api/admin/storage", {
        method: "POST"
      });
      const data = await readJsonResponse(response);

      if (!response.ok) {
        setStorageMessage(String(data.message || "Não foi possível preparar o Storage."));
        return;
      }

      setStorageStatus(data.storage as StorageAdminStatus);
      setStorageMessage(String(data.message || "Storage preparado."));
    } finally {
      setBusyKey(null);
    }
  }

  async function uploadAsset(file: File, target: UploadTarget, reference?: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target", target);
    if (reference) {
      formData.append("reference", reference);
    }

    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: formData
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(String(data.message || "Não foi possível enviar a imagem."));
    }

    setStorageStatus((current) => ({
      ...current,
      bucketExists: true,
      message: "Storage pronto para upload."
    }));

    return data.file as { url: string; path: string; bucket: string };
  }

  async function handleBannerUpload(slideId: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setBannerMessage("");
    setBusyKey(`banner:${slideId}`);

    try {
      const uploaded = await uploadAsset(file, "banner", slideId);
      updateBannerSlide(slideId, "imageUrl", uploaded.url);
      setBannerMessage("Imagem do slide enviada. Salve o banner para publicar a alteração.");
    } catch (error) {
      setBannerMessage(error instanceof Error ? error.message : "Falha no upload do slide.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePrimaryProductUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setMessage("");
    setBusyKey("product-primary");

    try {
      const reference = form.slug || slugify(form.name) || "produto";
      const uploaded = await uploadAsset(file, "product", reference);
      setForm((current) => ({
        ...current,
        imageUrl: uploaded.url,
        images: Array.from(new Set([uploaded.url, ...(current.images || []), current.imageUrl].filter(Boolean)))
      }));
      setMessage("Imagem principal enviada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha no upload da imagem principal.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleGalleryUpload(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    setMessage("");
    setBusyKey("product-gallery");

    try {
      const reference = form.slug || slugify(form.name) || "produto";
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const uploaded = await uploadAsset(file, "product", reference);
        uploadedUrls.push(uploaded.url);
      }

      setForm((current) => ({
        ...current,
        imageUrl: current.imageUrl || uploadedUrls[0],
        images: Array.from(new Set([...(current.images || []), current.imageUrl, ...uploadedUrls].filter(Boolean)))
      }));
      setMessage(`${uploadedUrls.length} imagem(ns) adicionada(s) à galeria.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha no upload da galeria.");
    } finally {
      setBusyKey(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    let specs: Record<string, string>;

    try {
      specs = parseSpecs(specsText);
    } catch {
      setMessage("Revise o JSON das especificações antes de salvar.");
      return;
    }

    const images = Array.from(new Set([form.imageUrl, ...(form.images || [])].filter(Boolean)));
    const payload: ProductInput = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: form.price ? Number(form.price) : null,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      imageUrl: form.imageUrl || images[0] || emptyProduct.imageUrl,
      images: images.length ? images : [form.imageUrl || emptyProduct.imageUrl],
      tags: Array.isArray(form.tags)
        ? form.tags
        : String(form.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
      useTags: Array.isArray(form.useTags)
        ? form.useTags
        : String(form.useTags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
      paymentInfo: form.paymentInfo || form.paymentNote || form.stockStatus,
      specs
    };

    const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      setMessage(String(data.message || "Não foi possível salvar o produto."));
      return;
    }

    setMessage(editingId ? "Produto atualizado." : "Produto criado.");
    setProductEditorOpen(false);
    resetForm();
    await loadProducts();
  }

  async function submitBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSaveBanner) return;

    const payload: HomeBannerSettings = {
      rotationMs: Math.max(1000, bannerForm.rotationMs || 4000),
      slides: bannerForm.slides.map((slide, index) => ({
        ...slide,
        id: slide.id || `banner-${index + 1}`
      }))
    };

    const response = await fetch("/api/site-settings/banner", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      setBannerMessage(String(data.message || "Não foi possível salvar o banner."));
      return;
    }

    setBannerForm((data.settings as HomeBannerSettings) || payload);
    setBannerMessage("Banner atualizado.");
  }

  async function removeProduct(productId: string) {
    const target = safeProducts.find((product) => product.id === productId);
    if (!window.confirm(`Remover ${target?.name || "este produto"} do catálogo?`)) {
      return;
    }

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE"
    });
    const data = await readJsonResponse(response);

    if (!response.ok) {
      setMessage(String(data.message || "Não foi possível remover o produto."));
      return;
    }

    setMessage("Produto removido.");
    if (editingId === productId) {
      setProductEditorOpen(false);
      resetForm();
    }
    await loadProducts();
  }

  async function logoutAdmin() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="admin-page">
      <Link className="brand compact admin-brand" href="/">
        <span className="brand-logo-wordmark">
          <img src={transparentLogoUrl} alt="ScannerTec Equipamentos Automotivos" />
        </span>
      </Link>

      <section className="admin-hero">
        <div>
          <p className="eyebrow">Painel</p>
          <h1>Produtos do catálogo</h1>
          <p>
            Organize o catálogo, ajuste banners e mantenha a loja pronta sem precisar perder tempo
            navegando entre blocos gigantes.
          </p>
        </div>
        <div className="admin-status-stack">
          <div className={`db-pill ${databaseConfigured ? "ok" : ""}`}>
            {databaseConfigured ? "Banco conectado" : "Usando dados de exemplo"}
          </div>
          <div className={`db-pill ${storageStatus.configured && storageStatus.bucketExists ? "ok" : ""}`}>
            {storageStatus.configured
              ? storageStatus.bucketExists
                ? "Storage pronto"
                : "Storage pendente"
              : "Storage não configurado"}
          </div>
          <button className="btn btn-secondary admin-logout-btn" type="button" onClick={logoutAdmin}>
            Sair do admin
          </button>
        </div>
      </section>

      <section className="admin-maintenance-card">
        <div>
          <p className="eyebrow">Manutenção em lote</p>
          <h2>Planilha de produtos</h2>
          <p>
            Exporte o catálogo, ajuste nome, descrição, preços, YouTube, detalhes e categoria no
            Excel e depois importe para atualizar tudo de uma vez.
          </p>
        </div>

        <div className="spreadsheet-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={exportSpreadsheet}
            disabled={busyKey === "spreadsheet-export" || busyKey === "spreadsheet-import"}
          >
            {busyKey === "spreadsheet-export" ? "Exportando..." : "Exportar Excel"}
          </button>

          <label className="btn btn-primary spreadsheet-upload">
            {busyKey === "spreadsheet-import" ? "Importando..." : "Importar Excel"}
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={importSpreadsheet}
              disabled={busyKey === "spreadsheet-export" || busyKey === "spreadsheet-import"}
            />
          </label>
        </div>

        <p className="inline-note">
          Imagens podem ser atualizadas pela planilha usando URL ou caminho do arquivo. O envio do
          arquivo da imagem continua pelo admin, dentro do editor do produto.
        </p>

        {spreadsheetMessage ? <p className="form-message">{spreadsheetMessage}</p> : null}
        {spreadsheetErrors.length ? (
          <div className="spreadsheet-errors">
            {spreadsheetErrors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="admin-grid">
        <form className="admin-form" onSubmit={submitBanner}>
          <div>
            <p className="eyebrow">Home</p>
            <h2>Banner rotativo</h2>
            <p>Crie slides, envie imagens e vincule produtos sem sair do painel.</p>
          </div>

          <div className="storage-card">
            <div>
              <strong>Bucket</strong>
              <span>{storageStatus.bucket}</span>
            </div>
            <div>
              <strong>Pastas</strong>
              <span>
                {storageStatus.folders.banners} / {storageStatus.folders.products}
              </span>
            </div>
            <p>{storageStatus.message}</p>
            <div className="form-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={refreshStorageStatus}
                disabled={busyKey === "storage-setup"}
              >
                Atualizar status
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={prepareStorage}
                disabled={busyKey === "storage-setup"}
              >
                {busyKey === "storage-setup" ? "Preparando..." : "Preparar storage"}
              </button>
            </div>
            {storageMessage ? <p className="form-message">{storageMessage}</p> : null}
          </div>

          <label>
            Rotação automática (ms)
            <input
              type="number"
              min={1000}
              step={1000}
              value={bannerForm.rotationMs}
              onChange={(event) => updateBannerField("rotationMs", Number(event.target.value) || 1000)}
            />
            <small>4000 = 4 segundos entre os slides.</small>
          </label>

          {safeSlides.map((slide, index) => (
            <div className="admin-subform" key={slide.id}>
              <div>
                <p className="eyebrow">Slide {index + 1}</p>
                <h3>{slide.title || "Novo slide"}</h3>
              </div>

              <label>
                Produto vinculado
                <select
                  value={slide.linkedProductSlug}
                  onChange={(event) => updateBannerSlide(slide.id, "linkedProductSlug", event.target.value)}
                >
                  <option value="">Selecionar produto</option>
                  {safeProducts.map((product) => (
                    <option key={product.slug} value={product.slug}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Texto superior
                <input
                  value={slide.eyebrow}
                  onChange={(event) => updateBannerSlide(slide.id, "eyebrow", event.target.value)}
                  placeholder="Destaque ScannerTec"
                />
              </label>

              <label>
                Título do banner
                <textarea
                  value={slide.title}
                  onChange={(event) => updateBannerSlide(slide.id, "title", event.target.value)}
                />
              </label>

              <label>
                Descrição do banner
                <textarea
                  value={slide.description}
                  onChange={(event) => updateBannerSlide(slide.id, "description", event.target.value)}
                />
              </label>

              <div className="asset-upload-grid">
                <label>
                  URL da imagem
                  <input
                    value={slide.imageUrl}
                    onChange={(event) => updateBannerSlide(slide.id, "imageUrl", event.target.value)}
                    placeholder="https://... ou /assets/banner-home.jpg"
                  />
                </label>

                <label>
                  Enviar nova imagem
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => handleBannerUpload(slide.id, event.target.files)}
                  />
                </label>
              </div>

              {slide.imageUrl ? (
                <div className="asset-preview">
                  <img src={slide.imageUrl} alt={`Preview do slide ${index + 1}`} />
                </div>
              ) : null}

              <div className="form-actions">
                <button className="btn btn-secondary" type="button" onClick={() => removeBannerSlide(slide.id)}>
                  Remover slide
                </button>
                {busyKey === `banner:${slide.id}` ? <span className="inline-note">Enviando imagem...</span> : null}
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button className="btn btn-secondary" type="button" onClick={addBannerSlide}>
              Adicionar slide
            </button>
          </div>

          {bannerMessage ? <p className="form-message">{bannerMessage}</p> : null}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={!canSaveBanner}>
              Salvar banner
            </button>
          </div>
        </form>

        <section className="admin-products-panel">
          <div className="admin-products-header">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2>Operação de produtos</h2>
              <p>Abra um item na lateral, ajuste rápido e volte para a lista sem perder o contexto.</p>
            </div>
            <button className="btn btn-primary" type="button" onClick={createProductDraft}>
              Novo produto
            </button>
          </div>

          <div className="admin-stats-grid">
            <article>
              <strong>{productStats.total}</strong>
              <span>Total no catálogo</span>
            </article>
            <article>
              <strong>{productStats.active}</strong>
              <span>Ativos no site</span>
            </article>
            <article>
              <strong>{productStats.featured}</strong>
              <span>Em destaque</span>
            </article>
            <article>
              <strong>{productStats.inactive}</strong>
              <span>Inativos</span>
            </article>
          </div>

          <div className="admin-toolbar">
            <label>
              Buscar produto
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Nome, marca, slug ou SKU"
              />
            </label>
            <label>
              Categoria
              <select
                value={productCategoryFilter}
                onChange={(event) => setProductCategoryFilter(event.target.value as ProductCategory | "todos")}
              >
                <option value="todos">Todas</option>
                {productCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={productStatusFilter}
                onChange={(event) => setProductStatusFilter(event.target.value as AdminStatusFilter)}
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
                <option value="destaques">Destaques</option>
              </select>
            </label>
          </div>

          {message ? <p className="form-message admin-products-message">{message}</p> : null}

          <div className="admin-list">
            {filteredProducts.map((product) => (
              <article className="admin-item" key={product.id}>
                <img src={product.imageUrl} alt={product.name} />
                <div className="admin-item-copy">
                  <div className="admin-item-topline">
                    <strong>{product.name}</strong>
                    <span className={`admin-state-pill ${product.active ? "ok" : ""}`}>
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <span>
                    {formatCategoryLabel(product.category)} · {product.brand || "ScannerTec"}
                  </span>
                  <small>
                    {product.price === null ? "Sob consulta" : formatCurrency(product.price)}
                    {" · "}
                    {product.featured ? "Destaque" : "Sem destaque"}
                    {product.sku ? ` · SKU ${product.sku}` : ""}
                  </small>
                </div>
                <div className="admin-item-actions">
                  <button type="button" onClick={() => editProduct(product)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => duplicateProduct(product)}>
                    Duplicar
                  </button>
                  <button type="button" onClick={() => removeProduct(product.id)}>
                    Remover
                  </button>
                </div>
              </article>
            ))}

            {!filteredProducts.length ? (
              <div className="admin-empty-state">Nenhum produto encontrado com os filtros atuais.</div>
            ) : null}
          </div>
        </section>
      </section>

      {productEditorOpen ? (
        <div className="admin-editor-drawer" role="dialog" aria-modal="true" aria-label="Editor de produto">
          <div className="admin-editor-backdrop" onClick={closeProductEditor}></div>
          <div className="admin-editor-panel">
            <header>
              <div>
                <span>{editingId ? "Editando produto" : "Novo produto"}</span>
                <h2>{editingId ? form.name || "Produto sem nome" : "Cadastrar produto"}</h2>
              </div>
              <button type="button" onClick={closeProductEditor} aria-label="Fechar editor de produto">
                <CloseIcon />
              </button>
            </header>

            <form className="admin-form admin-editor-form" onSubmit={submit}>
              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <strong>Base do produto</strong>
                  <span>Nome, slug, categoria e marca.</span>
                </div>

                <div className="form-row">
                  <label>
                    Nome do produto
                    <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
                  </label>
                  <label>
                    Slug
                    <input
                      value={form.slug || ""}
                      onChange={(event) => updateField("slug", event.target.value)}
                      placeholder="gerado automaticamente"
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    SKU / código interno
                    <input
                      value={form.sku || ""}
                      onChange={(event) => updateField("sku", event.target.value)}
                      placeholder="AUTEL-MX900"
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      value={form.category}
                      onChange={(event) => updateField("category", event.target.value as ProductCategory)}
                    >
                      {productCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Marca ou linha
                    <input
                      value={form.brand || ""}
                      onChange={(event) => updateField("brand", event.target.value)}
                      placeholder="Autel, Raven, Launch..."
                    />
                  </label>
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <strong>Texto comercial</strong>
                  <span>Resumo do card e detalhe da página do produto.</span>
                </div>

                <label>
                  Descrição curta
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    required
                  />
                </label>

                <label>
                  Descrição completa
                  <textarea
                    value={form.detail || ""}
                    onChange={(event) => updateField("detail", event.target.value)}
                    placeholder="Texto maior usado na página individual do produto."
                  />
                </label>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <strong>Preço e condições</strong>
                  <span>Valores, disponibilidade e condição de pagamento.</span>
                </div>

                <div className="form-row admin-form-row-2">
                  <label>
                    Preço
                    <input
                      type="number"
                      value={form.price ?? ""}
                      onChange={(event) => updateField("price", event.target.value ? Number(event.target.value) : null)}
                    />
                  </label>
                  <label>
                    Preço antigo
                    <input
                      type="number"
                      value={form.oldPrice ?? ""}
                      onChange={(event) =>
                        updateField("oldPrice", event.target.value ? Number(event.target.value) : null)
                      }
                    />
                  </label>
                </div>

                <div className="form-row admin-form-row-2">
                  <label>
                    Estoque/observação
                    <input value={form.stockStatus} onChange={(event) => updateField("stockStatus", event.target.value)} />
                  </label>
                  <label>
                    Condição de pagamento
                    <input
                      value={form.paymentInfo || ""}
                      onChange={(event) => updateField("paymentInfo", event.target.value)}
                      placeholder="R$ 5.500,00 em até 10x no cartão"
                    />
                  </label>
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <strong>Mídia</strong>
                  <span>Imagem principal, galeria e vídeo do YouTube.</span>
                </div>

                <div className="asset-upload-grid">
                  <label>
                    Imagem principal
                    <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
                  </label>

                  <label>
                    Enviar imagem principal
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(event) => handlePrimaryProductUpload(event.target.files)}
                    />
                  </label>
                </div>

                {form.imageUrl ? (
                  <div className="asset-preview product">
                    <img src={form.imageUrl} alt={form.name || "Preview do produto"} />
                  </div>
                ) : null}

                <label>
                  Galeria de imagens
                  <textarea
                    value={formatList(form.images)}
                    onChange={(event) => updateField("images", parseList(event.target.value))}
                    placeholder="Uma URL por linha. A primeira pode ser a imagem principal."
                  />
                </label>

                <label>
                  Link do YouTube do produto
                  <input
                    value={form.youtubeUrl || ""}
                    onChange={(event) => updateField("youtubeUrl", event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </label>

                <div className="asset-upload-grid">
                  <label>
                    Enviar imagens da galeria
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(event) => handleGalleryUpload(event.target.files)}
                    />
                  </label>

                  <div className="gallery-pills">
                    {(form.images || []).slice(0, 6).map((image, index) => (
                      <button
                        key={image}
                        className={`gallery-pill ${form.imageUrl === image ? "active" : ""}`}
                        type="button"
                        onClick={() => addImageToForm(image, true)}
                      >
                        {form.imageUrl === image ? `Principal ${index + 1}` : `Usar imagem ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gallery-preview-grid">
                  {(form.images || []).filter(Boolean).map((image, index) => (
                    <button
                      className={`gallery-preview-card ${form.imageUrl === image ? "active" : ""}`}
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => updateField("imageUrl", image)}
                    >
                      <img src={image} alt="" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="admin-form-section">
                <div className="admin-form-section-head">
                  <strong>Organização e filtros</strong>
                  <span>Tags internas, usos do catálogo e status de exibição.</span>
                </div>

                <label>
                  Tags comerciais
                  <input
                    value={(form.tags || []).join(", ")}
                    onChange={(event) => updateField("tags", parseList(event.target.value))}
                    placeholder="scanner, lançamento, promoção"
                  />
                </label>

                <label>
                  Usos/filtros
                  <input
                    value={(form.useTags || []).join(", ")}
                    onChange={(event) => updateField("useTags", parseList(event.target.value))}
                    placeholder="diagnóstico, motos, bateria, freios, auto center"
                  />
                </label>

                <label>
                  Especificações técnicas (JSON)
                  <textarea
                    value={specsText}
                    onChange={(event) => setSpecsText(event.target.value)}
                    placeholder={'{\n  "Voltagem": "220V",\n  "Garantia": "12 meses"\n}'}
                  />
                </label>

                <div className="checks">
                  <label>
                    <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} />
                    Ativo no site
                  </label>
                  <label>
                    <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
                    Destaque
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(form.mostViewed)}
                      onChange={(event) => updateField("mostViewed", event.target.checked)}
                    />
                    Apoio de ordenação
                  </label>
                </div>
              </section>

              {message ? <p className="form-message">{message}</p> : null}
              {busyKey === "product-primary" ? <p className="inline-note">Enviando imagem principal...</p> : null}
              {busyKey === "product-gallery" ? <p className="inline-note">Enviando galeria...</p> : null}

              <div className="form-actions admin-editor-actions">
                <button className="btn btn-primary" type="submit" disabled={!canSave}>
                  {editingId ? "Salvar alteração" : "Adicionar produto"}
                </button>
                <button className="btn btn-secondary" type="button" onClick={closeProductEditor}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
