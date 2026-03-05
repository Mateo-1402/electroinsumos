import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/validation";

interface Props {
  value: string;
  onChange: (value: string) => void;
  existingCategories: string[];
}

const CategoryCombobox = ({ value, onChange, existingCategories }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const allCategories = useMemo(() => {
    const set = new Set<string>([...DEFAULT_CATEGORIES, ...existingCategories]);
    return Array.from(set).sort();
  }, [existingCategories]);

  const showCreate = searchValue.length > 0 && !allCategories.some(
    (c) => c.toLowerCase() === searchValue.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {value || "Seleccionar categoría..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Buscar o crear categoría..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {showCreate ? null : "Sin resultados."}
            </CommandEmpty>
            <CommandGroup>
              {allCategories.map((cat) => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={() => {
                    onChange(cat);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === cat ? "opacity-100" : "opacity-0")} />
                  {cat}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem
                  value={searchValue}
                  onSelect={() => {
                    onChange(searchValue.trim());
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="text-primary"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Crear "{searchValue.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryCombobox;
