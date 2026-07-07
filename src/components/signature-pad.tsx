"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Upload, PenLine } from "lucide-react";

/**
 * Signature capture — draw with pointer or upload an image.
 * Emits a base64 PNG data URL via onChange.
 */
export function SignaturePad({ onChange, initial }: { onChange: (dataUrl: string | null) => void; initial?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(!!initial);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0F172A";
    if (initial) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = initial;
    }
  }, [initial]);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    setDrawing(true);
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.PointerEvent) {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  }
  function end() {
    if (!drawing) return;
    setDrawing(false);
    onChange(canvasRef.current!.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        setHasInk(true);
        onChange(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="relative rounded-lg border-2 border-dashed border-border bg-surface">
        <canvas
          ref={canvasRef}
          width={500}
          height={180}
          className="h-[180px] w-full cursor-crosshair touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            <PenLine className="me-2 h-4 w-4" /> Draw your signature here
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear}><Eraser className="h-4 w-4" /> Clear</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => (document.getElementById("sig-upload") as HTMLInputElement)?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input id="sig-upload" type="file" accept="image/*" className="hidden" onChange={upload} />
      </div>
    </div>
  );
}
