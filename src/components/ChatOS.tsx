import { useEffect, useRef, useState } from "react";
import { enviarMensagemOS, escutarMensagensOS, marcarChatComoLido, type MensagemChat } from "@/lib/chat";
import { Send, Loader2 } from "lucide-react";

type ChatOSProps = {
  token: string;
  remetente: "cliente" | "tecnico";
};

export function ChatOS({ token, remetente }: ChatOSProps) {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const containerMensagensRef = useRef<HTMLDivElement>(null);

  const rolarApenasMensagens = (suave = false) => {
    if (containerMensagensRef.current) {
      containerMensagensRef.current.scrollTo({
        top: containerMensagensRef.current.scrollHeight,
        behavior: suave ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    if (!token) return;
    marcarChatComoLido(token, remetente);

    const cancelar = escutarMensagensOS(token, (msgs) => {
      setMensagens(msgs);
      marcarChatComoLido(token, remetente);
      setTimeout(() => {
        rolarApenasMensagens(false);
      }, 50);
    });
    return () => cancelar();
  }, [token, remetente]);

  const [erroEnvio, setErroEnvio] = useState(false);

  const handleEnviar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!texto.trim() || enviando) return;

    setEnviando(true);
    setErroEnvio(false);
    const { mensagem: msgCriada, sucesso } = await enviarMensagemOS(token, texto, remetente);
    
    if (!sucesso) {
      setErroEnvio(true);
    }

    // Atualização otimista imediata na UI
    setMensagens((atuais) => {
      if (atuais.some(m => m.id === msgCriada.id)) return atuais;
      const novas = [...atuais, msgCriada];
      return novas.sort((a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime());
    });

    setTexto("");
    setEnviando(false);
    setTimeout(() => rolarApenasMensagens(true), 50);
  };

  return (
    <div className="flex flex-col h-[500px] max-h-[70vh] rounded-2xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
      {/* Cabeçalho */}
      <div className="border-b border-slate-800 bg-slate-950/50 p-4">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          {remetente === "cliente" ? "Falar com o Técnico" : "Chat com o Cliente"}
        </h3>
        <p className="text-xs text-slate-400">
          Você pode tirar dúvidas e acompanhar prazos por aqui.
        </p>
      </div>

      {/* Lista de Mensagens */}
      <div
        ref={containerMensagensRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {mensagens.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500 text-sm italic text-center px-4">
            Nenhuma mensagem ainda. Envie a primeira mensagem!
          </div>
        ) : (
          mensagens.map((msg) => {
            const isMinha = msg.remetente === remetente;
            return (
              <div key={msg.id} className={`flex ${isMinha ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                    isMinha
                      ? "bg-cyan-500 text-slate-950 rounded-tr-none"
                      : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
                  
                  <p className={`mt-1 text-[10px] text-right ${isMinha ? "text-cyan-900/60" : "text-slate-500"}`}>
                    {new Date(msg.dataISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Erro de envio */}
      {erroEnvio && (
        <div className="bg-red-900/50 border-t border-red-700 px-4 py-2 text-xs text-red-300 text-center">
          ⚠️ Mensagem salva localmente, mas falhou ao sincronizar. Verifique sua conexão.
        </div>
      )}

      {/* Input de Mensagem */}
      <form onSubmit={handleEnviar} className="border-t border-slate-800 bg-slate-950 p-3 flex gap-2 items-end">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 max-h-32 min-h-[44px] rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleEnviar();
            }
          }}
        />
        
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="p-3 bg-cyan-500 text-slate-950 rounded-xl font-bold hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
