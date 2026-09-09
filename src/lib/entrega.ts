import { salvarClienteFirebase, salvarEdicoesFirebase } from "./firebaseSync";
import { tokenOSPublica } from "./osPublica";
import { database } from "./firebase";
import { ref, update } from "firebase/database";

export async function confirmarEntregaComAssinatura(
  numeroOS: string,
  assinaturaBase64: string,
  tokenPublico?: string
) {
  const agoraISO = new Date().toISOString();
  const hoje = new Date().toLocaleDateString("pt-BR");
  const agoraHora = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let clienteAtualizado: any = null;

  // 1. Atualiza sos_clientes
  try {
    const salvo = localStorage.getItem("sos_clientes");
    if (salvo) {
      const todos = JSON.parse(salvo);
      const novos = todos.map((c: any) => {
        const match =
          c.os &&
          (String(c.os.numero) === String(numeroOS) ||
            String(c.id) === String(numeroOS) ||
            `OS-${c.id}` === String(numeroOS) ||
            `local-${c.id}` === String(numeroOS));

        if (match) {
          clienteAtualizado = {
            ...c,
            os: {
              ...c.os,
              statusOS: "Entregue",
              assinaturaEntrega: assinaturaBase64,
              assinaturaEm: agoraISO,
              dataRetirada: hoje,
              horaRetirada: agoraHora,
            },
          };
          return clienteAtualizado;
        }
        return c;
      });

      localStorage.setItem("sos_clientes", JSON.stringify(novos));
      if (clienteAtualizado) {
        void salvarClienteFirebase(clienteAtualizado);
      }
    }
  } catch (e) {
    console.warn("Erro ao atualizar sos_clientes com assinatura:", e);
  }

  // 2. Atualiza sos_eq_static_edits
  try {
    const staticSalvo = localStorage.getItem("sos_eq_static_edits");
    const edicoes: Record<string, any> = staticSalvo ? JSON.parse(staticSalvo) : {};

    const chaves = Object.keys(edicoes);
    const keyMatch =
      chaves.find(
        (k) =>
          k === numeroOS ||
          `OS-${k}` === numeroOS ||
          numeroOS.includes(k)
      ) || numeroOS;

    edicoes[keyMatch] = {
      ...(edicoes[keyMatch] || {}),
      status: "Entregue",
      assinaturaEntrega: assinaturaBase64,
      assinaturaEm: agoraISO,
      dataRetirada: hoje,
      horaRetirada: agoraHora,
    };
    localStorage.setItem("sos_eq_static_edits", JSON.stringify(edicoes));
    void salvarEdicoesFirebase(edicoes);
  } catch (e) {
    console.warn("Erro ao atualizar sos_eq_static_edits com assinatura:", e);
  }

  // 3. Atualiza publicOS no Firebase e localStorage
  const tokenFinal = tokenPublico || tokenOSPublica(numeroOS);
  try {
    const publicSalvo = localStorage.getItem("sos_public_os");
    const mapaPublico = publicSalvo ? JSON.parse(publicSalvo) : {};
    if (mapaPublico[tokenFinal]) {
      mapaPublico[tokenFinal] = {
        ...mapaPublico[tokenFinal],
        status: "Entregue",
        assinaturaEntrega: assinaturaBase64,
        assinaturaEm: agoraISO,
        dataRetirada: hoje,
        atualizadaEm: agoraISO,
      };
      localStorage.setItem("sos_public_os", JSON.stringify(mapaPublico));
    }

    await update(ref(database, `publicOS/${tokenFinal}`), {
      status: "Entregue",
      assinaturaEntrega: assinaturaBase64,
      assinaturaEm: agoraISO,
      dataRetirada: hoje,
      atualizadaEm: agoraISO,
    });
  } catch (e) {
    console.warn("Erro ao atualizar publicOS com assinatura:", e);
  }

  // 4. Notifica todas as abas e componentes
  window.dispatchEvent(new CustomEvent("sos-firebase-update"));
  window.dispatchEvent(new Event("storage"));
}
