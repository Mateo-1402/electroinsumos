import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import WireProductCard from "@/components/WireProductCard";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Todos",
  "Condensadores",
  "Alambres",
  "Aislantes",
  "Rodamientos",
  "Sellos",
  "Ventiladores",
  "Químicos",
  "Repuestos",
];

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

/** Extract the base name by removing AWG/gauge info from the name */
const getWireBaseName = (name: string): string => {
  // Remove patterns like "AWG 18", "#18", "Calibre 18", trailing gauge numbers
  return name
    .replace(/\s*(AWG|#|calibre|gauge)\s*\d+/gi, "")
    .replace(/\s*\d+\s*AWG/gi, "")
    .trim();
};

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
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

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "Todos" || p.category === activeCategory;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.specifications || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group wire products by base name
  const { wireGroups, nonWireProducts } = useMemo(() => {
    const wires = filtered.filter((p) => p.category === "Alambres");
    const nonWires = filtered.filter((p) => p.category !== "Alambres");

    const groups = new Map<string, Product[]>();
    for (const w of wires) {
      const base = getWireBaseName(w.name);
      if (!groups.has(base)) groups.set(base, []);
      groups.get(base)!.push(w);
    }

    return { wireGroups: groups, nonWireProducts: nonWires };
  }, [filtered]);

  const setCategory = (cat: string) => {
    if (cat === "Todos") {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">Catálogo de Productos</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="relative mb-4 lg:mb-6">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
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
              {/* Wire groups */}
              {Array.from(wireGroups.entries()).map(([baseName, variants]) =>
                variants.length > 1 ? (
                  <WireProductCard key={baseName} baseName={baseName} variants={variants} />
                ) : (
                  <ProductCard key={variants[0].id} {...variants[0]} />
                )
              )}
              {/* Non-wire products */}
              {nonWireProducts.map((p) => (
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
