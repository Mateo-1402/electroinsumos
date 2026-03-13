import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Check, ImageIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ImageProcessorProps {
  currentUrl: string | null;
  onProcessed: (url: string | null) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const ImageProcessor = ({ currentUrl, onProcessed, onProcessingChange }: ImageProcessorProps) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const convertToWebP = async (file: File): Promise<Blob> => {
    setStep("Convirtiendo a WebP...");
    setProgress(30);
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const maxSize = 1200;
    let w = bitmap.width;
    let h = bitmap.height;
    if (w > maxSize || h > maxSize) {
      const scale = maxSize / Math.max(w, h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    setProgress(60);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/webp", 0.85));
  };

  const uploadToStorage = async (blob: Blob): Promise<string> => {
    setStep("Subiendo imagen...");
    setProgress(80);
    const filename = `product_${Date.now()}.webp`;
    const { error } = await supabase.storage.from("productos").upload(filename, blob, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from("productos").getPublicUrl(filename);
    setProgress(100);
    return data.publicUrl;
  };

  useEffect(() => {
    onProcessingChange?.(processing);
  }, [processing, onProcessingChange]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    setProcessing(true);
    setProgress(10);
    try {
      const webp = await convertToWebP(file);
      const publicUrl = await uploadToStorage(webp);
      setPreview(publicUrl);
      onProcessed(publicUrl);
      setStep("");
      toast.success("Imagen subida ✅");
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast.error(`Error: ${err.message || "Fallo al subir imagen"}`);
      setStep("");
    } finally {
      setProcessing(false);
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onProcessed(null);
    toast.success("Imagen eliminada");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Imagen del producto</Label>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileRef.current?.click()}
        disabled={processing}
        className="w-full h-12 gap-2 active:scale-[0.98] border-dashed border-2"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs">{step}</span>
          </>
        ) : (
          <>
            <Upload size={16} />
            Subir imagen
          </>
        )}
      </Button>

      {processing && (
        <div className="space-y-1.5">
          <Progress value={progress} className="h-2" />
          <p className="text-[11px] text-muted-foreground text-center">{step}</p>
        </div>
      )}

      {preview && !processing && (
        <div className="relative">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-32 object-contain rounded-lg border border-border bg-muted/50"
            onError={() => setPreview(null)}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
            title="Eliminar imagen"
          >
            <Trash2 size={12} />
          </button>
          <div className="absolute top-1 right-1 bg-accent text-accent-foreground rounded-full p-0.5">
            <Check size={10} />
          </div>
        </div>
      )}

      {!preview && !processing && (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border bg-muted/30">
          <ImageIcon size={24} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
