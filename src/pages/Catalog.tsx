import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import VariantProductCard from "@/components/WireProductCard";
import { Input } from "@/components/ui/input";

const DEFAULT_CATEGORIES = [
  "Condensadores", "Alambres", "Aislantes", "Cables",
  "Rodamientos", "Sellos", "Ventiladores", "Químicos", "Repuestos",
];

const VARIANT_CATEGORIES = ["Alambres", "Aislantes", "Cables"];

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

  const { variantGroups, regularProducts } = useMemo(() => {
    const variants = filtered.filter((p) => VARIANT_CATEGORIES.includes(p.category));
    const regulars = filtered.filter((p) => !VARIANT_CATEGORIES.includes(p.category));

    const groups = new Map<string, { category: string; products: Product[] }>();
    for (const p of variants) {
      const base = getBaseName(p.name);
      const key = `${p.category}::${base}`;
      if (!groups.has(key)) groups.set(key, { category: p.category, products: [] });
      groups.get(key)!.products.push(p);
    }

    return { variantGroups: groups, regularProducts: regulars };
  }, [filtered]);

  const setCategory = (cat: string) => {
    if (cat === "Todos") {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", cat);
    }
    setSearchParams(searchParams);
    setMobileSidebarOpen(false);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No se encontraron productos.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from(variantGroups.entries()).map(([key, { category, products: vars }]) =>
                vars.length > 1 ? (
                  <VariantProductCard
                    key={key}
                    baseName={getBaseName(vars[0].name)}
                    variants={vars}
                    dropdownLabel={getDropdownLabel(category)}
                  />
                ) : (
                  <ProductCard key={vars[0].id} {...vars[0]} />
                )
              )}
              {regularProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
