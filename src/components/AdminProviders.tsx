import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Save, Search, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Provider {
  id: string; name: string; id_number: string | null;
  contact_person: string | null; phone: string | null;
  email: string | null; address: string | null;
  notes: string | null; created_at: string;
}

const EMPTY = { name: "", id_number: "", contact_person: "", phone: "", email: "", address: "", notes: "" };

const AdminProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProviders = async () => {
    const { data } = await supabase.from("providers").select("*").order("name");
    setProviders((data as Provider[]) || []);
  };

  useEffect(() => { fetchProviders(); }, []);

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.id_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true); };
  const openEdit = (p: Provider) => {
    setEditId(p.id);
    setForm({ name: p.name, id_number: p.id_number || "", contact_person: p.contact_person || "", phone: p.phone || "", email: p.email || "", address: p.address || "", notes: p.notes || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es requerido"); return; }
    const payload = { name: form.name.trim(), id_number: form.id_number || null, contact_person: form.contact_person || null, phone: form.phone || null, email: form.email || null, address: form.address || null, notes: form.notes || null };
    if (editId) {
      const { error } = await supabase.from("providers").update(payload).eq("id", editId);
      if (error) { toast.error(error.message); return; }
      toast.success("Proveedor actualizado ✅");
    } else {
      const { error } = await supabase.from("providers").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Proveedor creado ✅");
    }
    setDialogOpen(false);
    fetchProviders();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("providers").delete().eq("id", deleteId);
    if (error) { toast.error(error.message); setDeleteId(null); return; }
    toast.success("Proveedor eliminado");
    setDeleteId(null);
    fetchProviders();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11 md:h-9" />
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1 h-10 md:h-9 active:scale-95"><Plus size={16} /> <span className="hidden sm:inline">Agregar</span></Button>
      </div>

      {/* Mobile: Cards, Desktop: Table */}
      <div className="md:hidden space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="border border-border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{p.name}</p>
                {p.id_number && <p className="text-xs text-muted-foreground">ID: {p.id_number}</p>}
                {p.contact_person && <p className="text-xs text-muted-foreground">{p.contact_person}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="p-2 rounded hover:bg-muted text-primary"><Phone size={14} /></a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`} className="p-2 rounded hover:bg-muted text-primary"><Mail size={14} /></a>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1 h-9 gap-1 active:scale-95"><Pencil size={14} /> Editar</Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteId(p.id)} className="h-9 px-3 text-destructive border-destructive/30 hover:bg-destructive/10 active:scale-95"><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No se encontraron proveedores.</p>}
      </div>

      <div className="hidden md:block border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">Nombre</th>
              <th className="text-left p-3 font-medium">RIF/ID</th>
              <th className="text-left p-3 font-medium">Contacto</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Teléfono</th>
              <th className="text-right p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.id_number || "—"}</td>
                <td className="p-3 text-muted-foreground">{p.contact_person || "—"}</td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground">{p.phone || "—"}</td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No se encontraron proveedores.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-xs">Nombre / Razón Social *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">RIF/ID</Label><Input value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} className="h-11" /></div>
              <div><Label className="text-xs">Contacto</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="h-11" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" /></div>
            </div>
            <div><Label className="text-xs">Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-11" /></div>
            <div><Label className="text-xs">Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleSave} className="w-full gap-1 h-12 active:scale-[0.98]"><Save size={16} /> Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este proveedor?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProviders;
