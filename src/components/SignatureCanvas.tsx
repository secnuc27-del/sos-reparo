import { Eraser, PenLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

export function SignatureCanvas({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [desenhando, setDesenhando] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;
    const imagem = new Image();
    imagem.onload = () => {
      const contexto = canvas.getContext("2d");
      if (!contexto) return;
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    };
    imagem.src = value;
  }, [value]);

  const ponto = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const iniciar = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto) return;
    const posicao = ponto(event);
    contexto.beginPath();
    contexto.moveTo(posicao.x, posicao.y);
    contexto.lineWidth = 3;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";
    contexto.strokeStyle = "#1d4ed8";
    canvas.setPointerCapture(event.pointerId);
    setDesenhando(true);
  };

  const desenhar = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!desenhando) return;
    const contexto = canvasRef.current?.getContext("2d");
    if (!contexto || !canvasRef.current) return;
    const posicao = ponto(event);
    contexto.lineTo(posicao.x, posicao.y);
    contexto.stroke();
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const finalizar = () => setDesenhando(false);

  const limpar = () => {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto) return;
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-dashed border-input bg-white">
        <canvas
          ref={canvasRef}
          width={720}
          height={220}
          className="h-32 w-full touch-none cursor-crosshair"
          onPointerDown={iniciar}
          onPointerMove={desenhar}
          onPointerUp={finalizar}
          onPointerCancel={finalizar}
          aria-label="Campo para assinatura do cliente"
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-xs text-slate-400">
            <PenLine className="h-4 w-4" /> Desenhe a assinatura acima
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={limpar}
        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
      >
        <Eraser className="h-3.5 w-3.5" /> Limpar assinatura
      </button>
    </div>
  );
}
