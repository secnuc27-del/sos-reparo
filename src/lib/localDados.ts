const CLIENTES_STORAGE_KEY = "sos_clientes";

function compactarCliente(cliente: unknown, removerFotos = false) {
  if (!cliente || typeof cliente !== "object") return cliente;
  const registro = cliente as Record<string, unknown>;
  if (!registro.os || typeof registro.os !== "object") return { ...registro };

  const os = registro.os as Record<string, unknown>;
  return {
    ...registro,
    os: {
      ...os,
      fotoEquipamento: removerFotos ? "" : os.fotoEquipamento,
      fotoAntes: removerFotos ? "" : os.fotoAntes,
      fotoDepois: removerFotos ? "" : os.fotoDepois,
    },
  };
}

export function salvarClientesLocal(clientes: unknown[]) {
  try {
    localStorage.setItem(
      CLIENTES_STORAGE_KEY,
      JSON.stringify(clientes.map((cliente) => compactarCliente(cliente))),
    );
    return true;
  } catch {
    // Nunca substitua os dados por uma cópia sem fotos: isso fazia imagens
    // antigas desaparecerem quando o limite do localStorage era atingido.
    // Mantemos o cache anterior intacto e deixamos a tela continuar usando
    // os dados que já estão em memória.
    return false;
  }
}
