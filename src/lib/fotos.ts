const MAX_DIMENSION = 640;
const MAX_DATA_URL_LENGTH = 70_000;

/**
 * Reduz fotos de celulares/câmeras para que possam ser salvas com segurança
 * no armazenamento local e no Firebase Realtime Database.
 */
export function comprimirFoto(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    const liberarUrl = () => URL.revokeObjectURL(url);

    imagem.onload = () => {
      try {
        const maiorLado = Math.max(imagem.naturalWidth, imagem.naturalHeight);
        const escala = maiorLado > MAX_DIMENSION ? MAX_DIMENSION / maiorLado : 1;
        const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
        const altura = Math.max(1, Math.round(imagem.naturalHeight * escala));
        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");
        if (!contexto) throw new Error("Não foi possível preparar a imagem.");

        contexto.fillStyle = "#ffffff";
        contexto.fillRect(0, 0, largura, altura);
        contexto.drawImage(imagem, 0, 0, largura, altura);

        let qualidade = 0.7;
        let resultado = canvas.toDataURL("image/webp", qualidade);
        if (!resultado.startsWith("data:image/webp")) {
          resultado = canvas.toDataURL("image/jpeg", qualidade);
        }

        while (resultado.length > MAX_DATA_URL_LENGTH && qualidade > 0.42) {
          qualidade -= 0.08;
          resultado = canvas.toDataURL("image/webp", qualidade);
          if (!resultado.startsWith("data:image/webp")) {
            resultado = canvas.toDataURL("image/jpeg", qualidade);
          }
        }

        liberarUrl();
        resolve(resultado);
      } catch (erro) {
        liberarUrl();
        reject(erro);
      }
    };

    imagem.onerror = () => {
      liberarUrl();
      reject(new Error("Não foi possível ler esta foto."));
    };

    imagem.src = url;
  });
}
