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
    try {
      localStorage.setItem(
        CLIENTES_STORAGE_KEY,
        JSON.stringify(clientes.map((cliente) => compactarCliente(cliente, true))),
      );
      return true;
    } catch {
      return false;
    }
  }
}
