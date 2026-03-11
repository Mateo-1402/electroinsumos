import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
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

const ProductCard = ({ id, code, name, specifications, price, unit, stock, image_url }: ProductCardProps) => {
  const { addItem } = useCart();
  const outOfStock = stock <= 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow animate-fade-in flex flex-col">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden relative">
        {image_url ? (
          <img src={image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="text-muted-foreground text-4xl font-display font-bold opacity-20">EI</div>
        )}
        {outOfStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
        )}
      </div>
      <div className="p-4 md:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mt-1 line-clamp-2">{name}</h3>
        {specifications && (
          <p className="text-xs text-muted-foreground mt-1">{specifications}</p>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
            {unit && <span className="text-xs text-muted-foreground ml-1">/ {unit}</span>}
          </div>
          <span className={`text-xs ${stock < 5 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
            Stock: {stock}
          </span>
        </div>
        <Button
          size="sm"
          className="mt-3 w-full gap-1 h-11 active:scale-[0.98] transition-transform"
          onClick={() => addItem({ id, code, name, specifications, price })}
          disabled={outOfStock}
        >
          <Plus size={16} />
          {outOfStock ? "Agotado" : "Agregar a Cotización"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
