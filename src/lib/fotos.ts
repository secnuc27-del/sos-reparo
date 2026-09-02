const MAX_DIMENSION = 640;
const MAX_DATA_URL_LENGTH = 70_000;
const MIN_QUALITY = 0.42;
const MAX_TENTATIVAS = 12;

export const MAX_TAMANHO_FOTO_BYTES = 1024 * 1024 * 1024;

function gerarDataUrl(
  fonte: CanvasImageSource,
  larguraOriginal: number,
  alturaOriginal: number,
) {
  const maiorLado = Math.max(larguraOriginal, alturaOriginal);
  let escala = maiorLado > MAX_DIMENSION ? MAX_DIMENSION / maiorLado : 1;
  let qualidade = 0.7;
  let resultado = "";

  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa += 1) {
    const largura = Math.max(1, Math.round(larguraOriginal * escala));
    const altura = Math.max(1, Math.round(alturaOriginal * escala));
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("Nao foi possivel preparar a imagem.");

    contexto.fillStyle = "#ffffff";
    contexto.fillRect(0, 0, largura, altura);
    contexto.drawImage(fonte, 0, 0, largura, altura);

    const webp = canvas.toDataURL("image/webp", qualidade);
    resultado = webp.startsWith("data:image/webp")
      ? webp
      : canvas.toDataURL("image/jpeg", qualidade);

    if (resultado.length <= MAX_DATA_URL_LENGTH) return resultado;

    if (qualidade > MIN_QUALITY) {
      qualidade = Math.max(MIN_QUALITY, qualidade - 0.08);
    } else {
      escala *= 0.84;
    }
  }

  return resultado;
}

function comprimirImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const imagem = new Image();

    const limpar = () => URL.revokeObjectURL(url);
    imagem.onload = () => {
      try {
        resolve(gerarDataUrl(imagem, imagem.naturalWidth, imagem.naturalHeight));
      } catch (erro) {
        reject(erro);
      } finally {
        limpar();
      }
    };
    imagem.onerror = () => {
      limpar();
      reject(new Error("Nao foi possivel ler esta imagem neste navegador."));
    };
    imagem.src = url;
  });
}

function comprimirWebmComoImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const video = document.createElement("video");

    const limpar = () => URL.revokeObjectURL(url);
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.onloadeddata = () => {
      try {
        resolve(gerarDataUrl(video, video.videoWidth, video.videoHeight));
      } catch (erro) {
        reject(erro);
      } finally {
        limpar();
      }
    };
    video.onerror = () => {
      limpar();
      reject(new Error("Nao foi possivel ler este WebM como imagem."));
    };
    video.src = url;
    video.load();
  });
}

/** Comprime imagens e transforma WebM no primeiro quadro. */
export function comprimirFoto(arquivo: File): Promise<string> {
  if (arquivo.size > MAX_TAMANHO_FOTO_BYTES) {
    return Promise.reject(new Error("A foto precisa ter no maximo 1 GB."));
  }

  const ehWebm = arquivo.type === "video/webm" || /\.webm$/i.test(arquivo.name);
  const extensoesAceitas = /\.(jpn|jpg|jpeg|png|webp|gif|avif|heic|heif)$/i;
  if (!arquivo.type.startsWith("image/") && !ehWebm && !extensoesAceitas.test(arquivo.name)) {
    return Promise.reject(new Error("Escolha uma imagem JPG, PNG, WEBP, HEIC ou WebM."));
  }

  return ehWebm ? comprimirWebmComoImagem(arquivo) : comprimirImagem(arquivo);
}
