import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VariantProduct {
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

interface VariantProductCardProps {
  baseName: string;
  variants: VariantProduct[];
  dropdownLabel?: string;
}

const VariantProductCard = ({ baseName, variants, dropdownLabel = "Seleccionar variante" }: VariantProductCardProps) => {
  const { addItem } = useCart();
  const [selectedId, setSelectedId] = useState(variants[0]?.id || "");

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) || variants[0],
    [selectedId, variants]
  );

  if (!selected) return null;

  const outOfStock = selected.stock <= 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow animate-fade-in flex flex-col">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
        {selected.image_url ? (
          <img src={selected.image_url} alt={baseName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="text-muted-foreground text-4xl font-display font-bold opacity-20">EI</div>
        )}
        {outOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mt-1 line-clamp-2">{baseName}</h3>

        <div className="mt-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-11 text-xs">
              <SelectValue placeholder={dropdownLabel} />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={v.id} value={v.id} className="text-xs py-2.5">
                  {v.specifications || v.name} — ${v.price.toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-primary">${selected.price.toFixed(2)}</span>
            {selected.unit && <span className="text-xs text-muted-foreground ml-1">/ {selected.unit}</span>}
          </div>
          <span className={`text-xs ${selected.stock < 5 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
            Stock: {selected.stock}
          </span>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full gap-1 h-11 active:scale-[0.98] transition-transform"
          disabled={outOfStock}
          onClick={() =>
            addItem({
              id: selected.id,
              code: selected.code,
              name: selected.name,
              specifications: selected.specifications,
              price: selected.price,
            })
          }
        >
          <Plus size={16} />
          {outOfStock ? "Agotado" : "Agregar a Cotización"}
        </Button>
      </div>
    </div>
  );
};

export default VariantProductCard;
