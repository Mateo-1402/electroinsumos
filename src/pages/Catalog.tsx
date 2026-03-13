import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import VariantProductCard from "@/components/WireProductCard";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const DEFAULT_CATEGORIES = [
  "Condensadores", "Alambres", "Aislantes", "Cables",
  "Rodamientos", "Sellos", "Ventiladores", "Químicos", "Repuestos",
];

const VARIANT_CATEGORIES = ["Alambres", "Aislantes", "Cables"];
const PRODUCTS_PER_PAGE = 12;

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  specifications: string | null;
  price: number;
  unit: string | null;
  stock: number;
  image_url: string | null;
}

const getBaseName = (name: string): string => {
  return name
    .replace(/\s*(AWG|#|calibre|gauge)\s*\d+/gi, "")
    .replace(/\s*\d+\s*AWG/gi, "")
    .replace(/\s*\d+(\.\d+)?\s*(mm|cm|m|pulg|")\s*/gi, " ")
    .trim();
};

const getDropdownLabel = (category: string): string => {
  if (category === "Alambres") return "Seleccionar Calibre (AWG)";
  if (category === "Aislantes" || category === "Cables") return "Seleccionar Medida";
  return "Seleccionar variante";
};

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeCategory = searchParams.get("categoria") || "Todos";
  const currentPage = parseInt(searchParams.get("pagina") || "1", 10);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("category")
        .order("name");
      setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const CATEGORIES = useMemo(() => {
    const fromProducts = new Set(products.map((p) => p.category));
    const merged = new Set([...DEFAULT_CATEGORIES, ...fromProducts]);
    return ["Todos", ...Array.from(merged).sort()];
  }, [products]);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.specifications || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Build display items (variant groups + regular products) as a flat list for pagination
  const displayItems = useMemo(() => {
    const variants = filtered.filter((p) => VARIANT_CATEGORIES.includes(p.category));
    const regulars = filtered.filter((p) => !VARIANT_CATEGORIES.includes(p.category));

    const groups = new Map<string, { category: string; products: Product[] }>();
    for (const p of variants) {
      const base = getBaseName(p.name);
      const key = `${p.category}::${base}`;
      if (!groups.has(key)) groups.set(key, { category: p.category, products: [] });
      groups.get(key)!.products.push(p);
    }

    const items: { type: "variant"; key: string; category: string; products: Product[] }[] | { type: "regular"; product: Product }[] = [];
    for (const [key, { category, products: vars }] of groups.entries()) {
      (items as any[]).push({ type: "variant", key, category, products: vars });
    }
    for (const p of regulars) {
      (items as any[]).push({ type: "regular", product: p });
    }
    return items as ({ type: "variant"; key: string; category: string; products: Product[] } | { type: "regular"; product: Product })[];
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(displayItems.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = displayItems.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const setCategory = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "Todos") {
      newParams.delete("categoria");
    } else {
      newParams.set("categoria", cat);
    }
    newParams.delete("pagina");
    setSearchParams(newParams);
    setMobileSidebarOpen(false);
  };

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (page <= 1) {
      newParams.delete("pagina");
    } else {
      newParams.set("pagina", String(page));
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset page when search changes
  useEffect(() => {
    if (currentPage > 1 && search) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("pagina");
      setSearchParams(newParams);
    }
  }, [search]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Catálogo</h1>
        <button
          className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-muted-foreground px-3 py-2 rounded-lg bg-muted active:scale-95 transition-transform"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <SlidersHorizontal size={16} />
          Filtrar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className={`lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start ${mobileSidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="relative mb-3 lg:mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <nav className="flex flex-wrap lg:flex-col gap-2 pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-sm font-medium px-3 py-2.5 rounded-lg whitespace-nowrap transition-colors active:scale-[0.98] ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando productos...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No se encontraron productos.</p>
          ) : (
            <>
              {/* Results count */}
              <p className="text-xs text-muted-foreground mb-3">
                Mostrando {(safePage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(safePage * PRODUCTS_PER_PAGE, displayItems.length)} de {displayItems.length} productos
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedItems.map((item) =>
                  item.type === "variant" && item.products.length > 1 ? (
                    <VariantProductCard
                      key={item.key}
                      baseName={getBaseName(item.products[0].name)}
                      variants={item.products}
                      dropdownLabel={getDropdownLabel(item.category)}
                    />
                  ) : item.type === "variant" ? (
                    <ProductCard key={item.products[0].id} {...item.products[0]} />
                  ) : (
                    <ProductCard key={item.product.id} {...item.product} />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => safePage > 1 && setPage(safePage - 1)}
                        className={safePage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((p, i) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === safePage}
                            onClick={() => setPage(p)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => safePage < totalPages && setPage(safePage + 1)}
                        className={safePage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
