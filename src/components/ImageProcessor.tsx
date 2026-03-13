import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Check, ImageIcon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageProcessorProps {
  currentUrl: string | null;
  onProcessed: (url: string) => void;
  brandFrameUrl?: string | null;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const DEFAULT_FRAME = "/brand-frame.png";

const ImageProcessor = ({ currentUrl, onProcessed, brandFrameUrl = DEFAULT_FRAME, onProcessingChange }: ImageProcessorProps) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("");
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const removeBg = async (file: File): Promise<Blob> => {
    setStep("Eliminando fondo con IA...");
    const { removeBackground } = await import("@imgly/background-removal");
    const blob = await removeBackground(file, {
      output: { format: "image/png", quality: 0.9 },
    });
    return blob;
  };

  const applyFrame = async (imageBlob: Blob): Promise<Blob> => {
    if (!brandFrameUrl) return imageBlob;
    setStep("Aplicando marco corporativo...");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const [productImg, frameImg] = await Promise.all([
      createImageBitmap(imageBlob),
      loadImage(brandFrameUrl),
    ]);

    // Use frame dimensions as canvas size
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    // Center product inside frame with padding
    const pad = Math.min(canvas.width, canvas.height) * 0.1;
    const areaW = canvas.width - pad * 2;
    const areaH = canvas.height - pad * 2;
    const scale = Math.min(areaW / productImg.width, areaH / productImg.height);
    const w = productImg.width * scale;
    const h = productImg.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(productImg, x, y, w, h);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  };

  const convertToWebP = async (imageBlob: Blob): Promise<Blob> => {
    setStep("Convirtiendo a WebP...");
    const bitmap = await createImageBitmap(imageBlob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/webp", 0.85));
  };

  const uploadToStorage = async (blob: Blob): Promise<string> => {
    setStep("Subiendo a almacenamiento...");
    const filename = `product_${Date.now()}.webp`;
    const { error } = await supabase.storage.from("productos").upload(filename, blob, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data } = supabase.storage.from("productos").getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    setProcessing(true);
    try {
      // Step 1: Remove background
      let processed = await removeBg(file);
      // Step 2: Apply branded frame overlay
      processed = await applyFrame(processed);
      // Step 3: Convert to WebP
      processed = await convertToWebP(processed);
      // Step 4: Upload to storage
      const publicUrl = await uploadToStorage(processed);

      setPreview(publicUrl);
      onProcessed(publicUrl);
      setStep("");
      toast.success("Imagen procesada y subida ✅");
    } catch (err: any) {
      console.error("Image processing error:", err);
      toast.error(`Error: ${err.message || "Fallo en el procesamiento"}`);
      setStep("");
    }
    setProcessing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-1.5">
        <Sparkles size={14} className="text-primary" /> Pipeline de Imagen AI
      </Label>

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
            Subir imagen (BG removal + WebP)
          </>
        )}
      </Button>

      {processing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-2">
          <Loader2 size={12} className="animate-spin" />
          <span>{step}</span>
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default ImageProcessor;
