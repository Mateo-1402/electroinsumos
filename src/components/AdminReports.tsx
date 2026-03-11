import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Store, Wrench, Package } from "lucide-react";
import { toast } from "sonner";

const HEADER = [
  "ELECTROINSUMOS",
  "Quito, Ecuador",
  "Contacto: admin.geme@electroinsumos.com",
  "",
];

const downloadCSV = (filename: string, headerRow: string, rows: string[][]) => {
  const csvLines = [
    ...HEADER,
    headerRow,
    ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminReports = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const exportSales = async () => {
    setLoading("sales");
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "completed")
        .in("source", ["whatsapp", "physical"])
        .order("created_at", { ascending: false });

      const orders = (data || []) as any[];
      const rows = orders.map((o) => [
        new Date(o.created_at).toLocaleDateString("es-EC"),
        o.customer_name || "Anónimo",
        o.source === "physical" ? "Mostrador" : "WhatsApp",
        (o.total_price ?? 0).toFixed(2),
        (o.total_final_pagado ?? o.total_price ?? 0).toFixed(2),
        (o.items as any[]).map((i: any) => `${i.quantity}x ${i.name}`).join(" | "),
      ]);

      downloadCSV(
        `ventas_electroinsumos_${new Date().toISOString().slice(0, 10)}.csv`,
        "Fecha,Cliente,Fuente,Precio Original,Precio Final,Items",
        rows
      );
      toast.success("Reporte de ventas exportado ✅");
    } catch { toast.error("Error al exportar"); }
    setLoading(null);
  };

  const exportWorkshop = async () => {
    setLoading("workshop");
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "completed")
        .eq("source", "workshop")
        .order("created_at", { ascending: false });

      const orders = (data || []) as any[];
      const rows = orders.map((o) => [
        new Date(o.created_at).toLocaleDateString("es-EC"),
        (o.items as any[]).map((i: any) => `${i.quantity}x ${i.name}`).join(" | "),
        (o.items as any[]).reduce((s: number, i: any) => s + (i.quantity || 0), 0),
      ]);

      downloadCSV(
        `taller_electroinsumos_${new Date().toISOString().slice(0, 10)}.csv`,
        "Fecha,Items,Total Unidades",
        rows
      );
      toast.success("Reporte de taller exportado ✅");
    } catch { toast.error("Error al exportar"); }
    setLoading(null);
  };

  const exportInventory = async () => {
    setLoading("inventory");
    try {
      const { data } = await supabase.from("products").select("*").order("stock", { ascending: true });
      const products = (data || []) as any[];
      const rows = products.map((p) => {
        const stock = p.stock ?? 0;
        const min = p.min_stock ?? 5;
        const status = stock === 0 ? "🔴 Agotado" : stock <= min ? "🟠 Bajo" : "🟢 OK";
        return [
          p.code, p.name, p.category, p.specifications || "",
          (p.price ?? 0).toFixed(2), stock, p.unit || "un", min,
          ((p.price ?? 0) * stock).toFixed(2), status,
        ];
      });

      downloadCSV(
        `inventario_electroinsumos_${new Date().toISOString().slice(0, 10)}.csv`,
        "Código,Nombre,Categoría,Especificaciones,Precio,Stock,Unidad,Stock Mínimo,Valoración,Estado",
        rows
      );
      toast.success("Reporte de inventario exportado ✅");
    } catch { toast.error("Error al exportar"); }
    setLoading(null);
  };

  const reports = [
    { key: "sales", label: "Reporte de Ventas", desc: "POS y WhatsApp con precios finales", icon: Store, action: exportSales },
    { key: "workshop", label: "Reporte de Taller", desc: "Consumo interno (revenue $0)", icon: Wrench, action: exportWorkshop },
    { key: "inventory", label: "Reporte de Inventario", desc: "Snapshot actual con semáforo y valoración", icon: Package, action: exportInventory },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold">Reportes con Membrete</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.key} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <r.icon size={18} className="text-primary" /> {r.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <Button onClick={r.action} disabled={loading === r.key} variant="outline" className="w-full gap-2">
                <FileDown size={16} />
                {loading === r.key ? "Exportando..." : "Exportar CSV"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminReports;
